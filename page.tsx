"use client";

import { useState } from "react";

export default function BakusaiViewer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");

  function getTid(url) {
    const match = url.match(/tid=(\d+)/);
    return match ? match[1] : null;
  }

  async function fetchAllPages(tid) {
    const allPosts = [];
    let finalTitle = "";
    for (let tp = 50; tp >= 1; tp--) {
      const res = await fetch(`/api/bakusai?tid=${tid}&tp=${tp}`);
      if (!res.ok) break;
      const data = await res.json();
      if (data.posts.length === 0) break;
      if (!finalTitle && data.title) finalTitle = data.title;
      allPosts.push(...data.posts);
    }
    setTitle(finalTitle);
    setPosts(allPosts.reverse());
  }

  const handleLoad = async () => {
    setLoading(true);
    setPosts([]);
    const tid = getTid(url);
    if (!tid) {
      alert("URLにtid=が含まれていません");
      setLoading(false);
      return;
    }
    await fetchAllPages(tid);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>爆サイスーパービューア（CORS回避版）</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="爆サイスレッドのURLを貼ってください"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }}
        />
        <button onClick={handleLoad} disabled={loading} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
          {loading ? "読み込み中..." : "読み込む"}
        </button>
      </div>
      {title && <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>🧵 {title}</h2>}
      {posts.map((post, idx) => (
        <div key={idx} style={{ border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1rem', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
            {post.num} {post.date}
          </div>
          <div style={{ fontSize: '1rem' }} dangerouslySetInnerHTML={{ __html: post.msg }} />
        </div>
      ))}
      {posts.length > 0 && (
        <p style={{ textAlign: 'center', color: 'gray', marginTop: '1rem' }}>
          ✅ {posts.length} 件のレスを読み込みました
        </p>
      )}
    </div>
  );
}
