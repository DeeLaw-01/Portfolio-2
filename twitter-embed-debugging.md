# When Twitter Embeds Break Because Infrastructure is Broken

So I wanted to add Twitter/X embeds to my blog. You know, those nice little tweet cards that show up when you paste a tweet URL? Should be simple, right? Just use Twitter's embed script, slap it in, done.

**Spoiler alert:** It wasn't simple. And the reason is frustratingly vague.

## The Problem

I'm building a personal portfolio/blog site, and I wanted to be able to embed tweets in my blog posts. You paste a URL like `https://x.com/someone/status/1234567890`, and boom — beautiful tweet card appears.

I started with the obvious approach: Twitter's official embed script. You know, the one everyone uses. Load `platform.twitter.com/widgets.js`, create a `<blockquote class="twitter-tweet">`, call `twttr.widgets.load()`, and you're golden.

Except I wasn't golden. The embeds would partially work — the text would come through, but the styling was completely broken. No CSS, no layout, just raw text. Or sometimes it would show "Loading tweet..." forever, then fail silently. No errors in the console, nothing. Just a broken embed.

## The First Fix (That Didn't Fix Anything)

I figured maybe the script wasn't loading properly. So I added better error handling, retry logic, promises to ensure the script loaded before trying to render. Still nothing.

Then I tried Twitter's oEmbed API (`publish.twitter.com/oembed`). Fetch the embed HTML server-side, inject it, load the widget. Nope. Still broken.

I tried the blockquote method — Twitter's "official" way. Create a blockquote element, let their script parse it. Same result: "Loading tweet..." forever.

I even tried the React-specific workaround: load the script properly with `document.createElement('script')`, then call `twttr.widgets.load()` in `componentDidMount` and `componentDidUpdate`. This is a known issue with Twitter embeds in React — the script needs to be loaded dynamically and the widgets need to be explicitly loaded after the component mounts. Still nothing.

At this point, I'm thinking: "What the hell? This is literally their documented way of doing embeds, plus all the React-specific workarounds. Why isn't it working?"

## The Realization

After multiple failed attempts, I remembered I live in Pakistan and almost a year ago there was a case where the government banned Micrsofts NuGet packages CDNs for some godforsaken reason?

And that's when it clicked.

**Twitter's embed infrastructure isn't working from Pakistan.**

Twitter itself is accessible — I can browse `twitter.com` and `x.com` just fine. But the embed infrastructure? REALLY? The embed script (`platform.twitter.com/widgets.js`) and the oEmbed API (`publish.twitter.com/oembed`) aren't loading properly. The text might come through, but the CSS doesn't. The scripts fail silently.

It could be:

- ISP-level filtering of specific CDN domains
- Broken routing to Twitter's embed CDN
- Geo-blocking of embed infrastructure even though the main site works
- Or just Twitter's embed system being janky in general

Whatever it is, no amount of code fixes was going to make those embed domains load reliably from Pakistan. I was trying to debug a CDN/infrastructure problem with JavaScript, which is like trying to beat dark souls 1 with no weapons. Someone else can probably do it, but that someone else is not going to be. I'm not at that level of grassless yet.

## The Solution

The fix was to completely bypass Twitter's infrastructure. Instead of loading their scripts or calling their APIs, I used [`react-tweet`](https://github.com/vercel/react-tweet) by Vercel. It renders tweets as **static HTML/CSS** — no Twitter scripts needed.

But here's the kicker: `react-tweet` still needs to fetch tweet data from Twitter's syndication CDN (`cdn.syndication.twimg.com`). And that might have the same issues from my location.

So I added a **backend proxy**. My server (hosted on Vercel, not in Pakistan) fetches the tweet data from Twitter's syndication API, then passes it to the frontend. The frontend never talks to Twitter directly — it only talks to my backend, which doesn't have the same CDN/routing issues.

```javascript
// Backend proxy endpoint
app.get('/api/twitter/tweet/:id', async (req, res) => {
  const { id } = req.params
  // Fetch from Twitter's syndication API (server-side, not blocked)
  const response = await fetch(
    `https://cdn.syndication.twimg.com/tweet-result?id=${id}&...`
  )
  const data = await response.json()
  res.json({ data }) // react-tweet expects { data: ... } wrapper
})
```

```tsx
// Frontend uses react-tweet with the proxy
<Tweet
  id={tweetId}
  apiUrl={`${API_URL}/api/twitter/tweet/${tweetId}`}
  fallback={<LoadingSpinner />}
/>
```

Now it works perfectly. The tweet renders beautifully, with all the styling, profile pictures, media, likes — everything. And it works from Pakistan because my backend does the heavy lifting, bypassing whatever CDN/routing issues were breaking the embeds.

## The Lesson

Sometimes the problem isn't your code. Sometimes it's that the infrastructure you're depending on is broken in ways you can't control. CDN routing issues, ISP filtering, geo-blocking of specific services — they can all break your "simple" integrations in ways you never expected.

Also, if you're building something that needs to work globally, remember that not everyone has the same internet access you do. What works from one location might be broken from another, even if the main service is accessible. Sometimes you need to proxy things through your own infrastructure to guarantee reliability.

---

**TL;DR:** Twitter embeds were broken from Pakistan — text loaded but CSS didn't, probably due to CDN/routing issues. Fixed it by using `react-tweet` + a backend proxy so the frontend never talks to Twitter's embed infrastructure directly. Sometimes the problem is infrastructure, not your code.
