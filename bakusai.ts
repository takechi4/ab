import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tid, tp } = req.query;
  if (!tid || !tp) {
    return res.status(400).json({ error: 'Missing tid or tp parameter' });
  }

  try {
    const response = await fetch(`https://bakusai.com/thr_res/?tid=${tid}&tp=${tp}`);
    const html = await response.text();

    const { JSDOM } = await import('jsdom');
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const titleEl = doc.querySelector('.threadTitle, .title, h1');
    const title = titleEl ? titleEl.textContent?.trim() || '' : '';

    const posts: { num: string; date: string; msg: string }[] = [];
    const resAreas = doc.querySelectorAll('.resArea');
    resAreas.forEach((area) => {
      const num = area.querySelector('.resNo')?.textContent?.trim() || '';
      const date = area.querySelector('.resDate')?.textContent?.trim() || '';
      const msg = area.querySelector('.resMsg')?.innerHTML?.trim() || '[本文なし]';
      posts.push({ num, date, msg });
    });

    res.status(200).json({ title, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
