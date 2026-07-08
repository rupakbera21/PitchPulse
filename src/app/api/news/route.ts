import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const worldCupNews = [
      {
        title: "Argentina's manager expects a tough tactical battle against Egypt in Atlanta",
        link: "https://www.fifa.com/worldcup",
        pubDate: new Date().toISOString()
      },
      {
        title: "USA fans gather in Seattle ahead of high-stakes Round of 16 clash with Belgium",
        link: "https://www.fifa.com/worldcup",
        pubDate: new Date().toISOString()
      },
      {
        title: "Jude Bellingham insists England can go all the way after defeating Mexico 3-2",
        link: "https://www.fifa.com/worldcup",
        pubDate: new Date().toISOString()
      },
      {
        title: "Portugal vs Spain: Historic Iberian derby set to ignite Dallas in Round of 16",
        link: "https://www.fifa.com/worldcup",
        pubDate: new Date().toISOString()
      },
      {
        title: "Morocco cruise into the Quarter-finals with a dominant 3-0 victory over Canada",
        link: "https://www.fifa.com/worldcup",
        pubDate: new Date().toISOString()
      },
      {
        title: "France edge out Paraguay 2-1 in Philadelphia; Mbappe scores the winner",
        link: "https://www.fifa.com/worldcup",
        pubDate: new Date().toISOString()
      },
      {
        title: "Switzerland and Colombia prepare for a battle of styles in Vancouver",
        link: "https://www.fifa.com/worldcup",
        pubDate: new Date().toISOString()
      },
      {
        title: "Concierge AI activated across all 16 host cities to assist fans in real-time",
        link: "https://www.fifa.com/worldcup",
        pubDate: new Date().toISOString()
      }
    ];

    // Shuffle the array to provide fresh news on every reload
    const shuffledNews = [...worldCupNews].sort(() => 0.5 - Math.random());

    return NextResponse.json({ news: shuffledNews });
  } catch (error) {
    console.error("News API Error:", error);
    return NextResponse.json({ news: [] }, { status: 500 });
  }
}
