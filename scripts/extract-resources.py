import json, os, re, posixpath
from bs4 import BeautifulSoup, NavigableString, Tag

# Scrapes nothing itself: run against a local mirror of
# https://equal-resources.vishnu-b.workers.dev (pages + images/), e.g.
#   python3 scripts/extract-resources.py <mirror-dir> <out-dir>
# Needs beautifulsoup4. Output goes to src/content/resources/*.json.
import sys
SITE = sys.argv[1] if len(sys.argv) > 1 else "site"
OUT = sys.argv[2] if len(sys.argv) > 2 else "out"
os.makedirs(OUT, exist_ok=True)
used_images = set()


ROUTES = [
    (r"^resources(\.html)?$", "/resources"),
    (r"^blogs\.html$", "/blog"),
    (r"^blogs/(.+)\.html$", r"/blog/\1"),
    (r"^updates\.html$", "/updates"),
    (r"^faqs\.html$", "/faqs"),
    (r"^caller-faqs\.html$", "/faqs/callers"),
    (r"^help-center/android-faqs\.html$", "/faqs/android"),
    (r"^help-center/android-faqs/(.+)\.html$", r"/faqs/android/\1"),
    (r"^help-center/ios-faqs\.html$", "/faqs/ios"),
    (r"^help-center/help-ios/(.+)\.html$", r"/faqs/ios/\1"),
    (r"^privacy-policy\.html$", "/privacy-policy"),
    (r"^contact-us\.html$", "/contact"),
]

def resolve(page, ref):
    if ref.startswith("/"):
        return ref[1:]
    return posixpath.normpath(posixpath.join(posixpath.dirname(page), ref))

def route(page, href):
    if not href or href.startswith(("http", "mailto:", "tel:", "#")):
        return href
    path, _, frag = href.partition("#")
    rel = resolve(page, path)
    for pat, rep in ROUTES:
        if re.match(pat, rel):
            out = re.sub(pat, rep, rel)
            return out + ("#" + frag if frag else "")
    print("UNMAPPED LINK", page, href)
    return href

def img(page, src):
    rel = resolve(page, src)
    name = posixpath.basename(rel)
    used_images.add(name)
    return f"/resources/{name}"

def text(el):
    return re.sub(r"\s+", " ", el.get_text(" ", strip=True).replace("‍", "")).strip() if el else ""

ALLOWED = {"p", "br", "strong", "b", "em", "i", "a", "ul", "ol", "li", "h2", "h3", "h4", "img", "blockquote"}

def clean(page, node):
    """Return sanitized inner HTML of node: whitelisted tags, minimal attributes, paragraphs from <br><br>."""
    def walk(n):
        if isinstance(n, NavigableString):
            s = str(n).replace("‍", "")
            return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        if not isinstance(n, Tag):
            return ""
        inner = "".join(walk(c) for c in n.children)
        name = n.name
        if name == "b": name = "strong"
        if name == "i": name = "em"
        if name not in ALLOWED:
            # block-level wrappers become paragraph breaks
            return inner + ("<br><br>" if name in ("div", "section") and inner.strip() else "")
        if name == "br":
            return "<br>"
        if name == "img":
            return f'<img src="{img(page, n["src"])}" alt="{n.get("alt", "")}">' if n.get("src") else ""
        if name == "a":
            href = route(page, n.get("href", ""))
            ext = ' target="_blank" rel="noopener noreferrer"' if href.startswith("http") else ""
            return f'<a href="{href}"{ext}>{inner}</a>'
        if name in ("strong", "em") and not inner.strip():
            return inner
        return f"<{name}>{inner}</{name}>"

    html = "".join(walk(c) for c in node.children)
    return paragraphs(html)

BLOCK = re.compile(r"^\s*<(ul|ol|h2|h3|h4|blockquote|p|img)\b")

def paragraphs(html):
    html = re.sub(r"\s+", " ", html)
    # Line breaks at the edges of inline tags belong outside them, or the split
    # below would cut a <strong> in half.
    for _ in range(4):
        html = re.sub(r"<(strong|em)>((?:\s*<br>\s*)+)", r"\2<\1>", html)
        html = re.sub(r"((?:\s*<br>\s*)+)</(strong|em)>", r"</\2>\1", html)
        html = re.sub(r"<(strong|em)>(\s*)</\1>", r"\2", html)
    html = re.sub(r"\s+</(strong|em)>", r"</\1> ", html)
    # Split on two-or-more <br> into paragraphs; keep existing block elements as-is.
    parts = re.split(r"(?:\s*<br>\s*){2,}", html)
    out = []
    for part in parts:
        part = re.sub(r"^(\s*<br>\s*)+|(\s*<br>\s*)+$", "", part).strip()
        # split out block children so they aren't wrapped in <p>
        for chunk in re.split(r"(<(?:ul|ol|h2|h3|h4|blockquote|p)\b.*?</(?:ul|ol|h2|h3|h4|blockquote|p)>|<img [^>]*>)", part):
            chunk = re.sub(r"^(\s*<br>\s*)+|(\s*<br>\s*)+$", "", chunk).strip()
            if not chunk:
                continue
            out.append(chunk if BLOCK.match(chunk) else f"<p>{chunk}</p>")
    html = "".join(out)
    # Runs of "- item" / "• item" paragraphs are lists typed as text.
    html = re.sub(
        r"(?:<p>\s*[-•–]\s+.*?</p>)+",
        lambda m: "<ul>" + re.sub(r"<p>\s*[-•–]\s+(.*?)</p>", r"<li>\1</li>", m.group(0)) + "</ul>",
        html,
    )
    html = re.sub(r"<p>\s*</p>", "", html)
    html = re.sub(r"\s+(</(?:p|li|h2|h3)>)", r"\1", html)
    html = re.sub(r"(<(?:p|li)>)\s+", r"\1", html)
    return html

def soup(page):
    return BeautifulSoup(open(f"{SITE}/{page}", encoding="utf8").read(), "html.parser")

def save(name, data):
    json.dump(data, open(f"{OUT}/{name}.json", "w"), indent=2, ensure_ascii=False)
    print("wrote", name)

# ---------- hubs (resources, faqs, android, ios) ----------
def hub(page):
    s = soup(page)
    title_el = s.select_one("h1")
    lede = s.select_one(".resources-subtitle, .eq-page-lede")
    cards = []
    for a in s.select("a.faq-category-div"):
        im = a.select_one("img")
        cards.append({
            "title": text(a.select_one(".faq-category-title")),
            "description": text(a.select_one(".eq-card-desc")) or None,
            "href": route(page, a["href"]),
            "image": img(page, im["src"]) if im else None,
            "imageAlt": im.get("alt", "") if im else "",
        })
    return {"title": text(title_el), "lede": text(lede), "cards": cards}

save("resources-hub", hub("resources.html"))
save("faqs-hub", hub("faqs.html"))

# ---------- QA pages ----------
def qa_page(page):
    s = soup(page)
    title = text(s.select_one(".support-item-title"))
    lede = text(s.select_one(".eq-page-lede"))
    items = []
    for acc in s.select(".uui-faq01_accordion"):
        anchor = acc.select_one(".anchor-div")
        q = text(acc.select_one(".faq-question-title"))
        q = re.sub(r"^\d+\.\s*", "", q)
        ans = acc.select_one(".uui-faq01_answer")
        # The source's screenshot sliders point at images that 404 and are
        # attached to the wrong questions, so they are dropped.
        for sl in ans.select(".w-slider"):
            sl.decompose()
        items.append({
            "id": anchor.get("id") if anchor and anchor.get("id") else re.sub(r"[^a-z0-9]+", "-", q.lower()).strip("-")[:60],
            "question": q,
            "answer": clean(page, ans),
        })
    return {"title": title, "lede": lede, "items": items}

save("caller-faqs", qa_page("caller-faqs.html"))

for platform, hubpage in (("android", "help-center/android-faqs.html"), ("ios", "help-center/ios-faqs.html")):
    h = hub(hubpage)
    cats = []
    for c in h["cards"]:
        slug = c["href"].rsplit("/", 1)[1]
        src = ("help-center/android-faqs/" if platform == "android" else "help-center/help-ios/") + slug + ".html"
        qa = qa_page(src)
        cats.append({"slug": slug, "title": c["title"], "image": c["image"], "items": qa["items"]})
    save(f"help-{platform}", {"title": h["title"], "lede": h["lede"], "categories": cats})

# ---------- blog ----------
s = soup("blogs.html")
listing = []
hero = s.select_one("a.eq-post-hero")
listing.append({"href": hero["href"], "sub": text(hero.select_one(".eq-post-hero-sub"))})
for a in s.select("a.eq-post-card"):
    listing.append({"href": a["href"], "sub": text(a.select_one(".eq-post-card-sub"))})
posts = []
for entry in listing:
    page = entry["href"]
    p = soup(page)
    hero_img = p.select_one(".blog-hero-image-div img")
    body = p.select_one(".blog-copy-section")
    # Blog bodies: each .blog-paragraph-div = optional heading + text
    html = ""
    for div in body.select(".blog-paragraph-div"):
        h = div.select_one(".blog-copy-title")
        if h:
            html += f"<h2>{text(h)}</h2>"
            h.decompose()
        html += clean(page, div)
    # Any images directly in body outside paragraph divs
    posts.append({
        "slug": posixpath.basename(page)[:-5],
        "title": text(p.select_one(".blog-page-title")),
        "subtitle": text(p.select_one(".blog-page-subtitle")) or entry["sub"],
        "date": text(p.select_one(".blog-page-date")),
        "image": img(page, hero_img["src"]) if hero_img else None,
        "body": html,
    })
save("blog", posts)

# ---------- updates ----------
s = soup("updates.html")
groups = []
for g in s.select(".release-group"):
    items = []
    for card in g.select(".patch-card"):
        media = card.select_one(".patch-feature-gif-div img")
        paras = [clean("updates.html", d) for d in card.select(".patch-feature-text")]
        items.append({
            "title": text(card.select_one(".patch-feature-title")),
            "date": text(card.select_one(".patch-feature-date")),
            "body": "".join(paras),
            "media": img("updates.html", media["src"]) if media else None,
        })
    groups.append({"month": text(g.select_one(".release-month")), "items": items})
save("updates", {"title": text(s.select_one("h1")), "lede": text(s.select_one(".eq-page-lede")), "groups": groups})

# ---------- privacy ----------
s = soup("privacy-policy.html")
sections = []
for sp in s.select(".single-policy"):
    h = sp.select_one(".policy-title")
    title = text(h) if h else None
    if h: h.decompose()
    sections.append({"title": title, "body": clean("privacy-policy.html", sp)})
save("privacy", {"title": text(s.select_one(".policy-page-title")), "effective": text(s.select_one(".tnc-subtitle")), "sections": sections})

# ---------- contact ----------
s = soup("contact-us.html")
save("contact", {
    "title": text(s.select_one("h1")),
    "intro": text(s.select_one(".contact-intro")),
    "cards": [{"label": text(a.select_one(".contact-card-label")), "value": text(a.select_one(".contact-card-value")),
               "note": text(a.select_one(".contact-card-note")), "href": a["href"],
               "kind": "phone" if a["href"].startswith("tel:") else "email"} for a in s.select("a.contact-card")],
    "social": [{"label": text(a), "href": a["href"]} for a in s.select("a.social-chip")],
    "appNote": {"title": text(s.select_one(".patch-notes-description-title")), "body": text(s.select_one(".patch-notes-description-subtitle"))},
})

json.dump(sorted(used_images), open(f"{OUT}/_images.json", "w"), indent=1)
missing = [i for i in used_images if not os.path.exists(f"{SITE}/images/{i}")]
print("images used:", len(used_images), "missing:", missing)
