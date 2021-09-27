import { supabase } from 'lib/supabase'
import styles from '../styles/Dashboard.module.css'
import { EventData } from 'lib/types'

interface ContentUrl {
  visitorIds: string[]
  entries: number
  visitors: number
  views: number
}

interface Content {
  [url: string]: ContentUrl
}

export default function Dashboard({ data, error }) {
  if (data) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <h1 className={styles.headline}>Puroviva Analytics Dashboard</h1>
          <div className={styles.table}>
            <div className={styles.row}>
              <div>URL</div>
              <div>Entries</div>
              <div>Visitors</div>
              <div>Views</div>
            </div>
            {Object.entries(data.content).map(
              ([url, row]: [string, ContentUrl]) => (
                <div className={styles.row} key={url}>
                  <div>{url}</div>
                  <div>{row.entries}</div>
                  <div>{row.visitors}</div>
                  <div>{row.views}</div>
                </div>
              )
            )}
          </div>
          <div className={styles.table}>
            <div className={styles.row}>
              <div>Language</div>
              <div>Visitors</div>
            </div>
            {Object.entries(data.languages.count).map(([language, count]) => (
              <div className={styles.row} key={language}>
                <div>{language}</div>
                <div>{count}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  } else if (error) {
    return <div>{error.message}</div>
  } else {
    return <div>Neither nor!!!</div>
  }
}

export async function getServerSideProps() {
  const allRows = await supabase
    .from<EventData>('events')
    .select('*', { count: 'exact' })

  const uniqueVisitorIds = new Set(allRows.data.map((row) => row.puid))
  const allPageViews = allRows.data.filter(
    (row) => row.eventName === 'page_view'
  )

  /* Table "Content" displays number of entries, visitors and views for each URL */
  const content: Content = allPageViews.reduce((acc, current) => {
    if (!acc[current.pageId]) {
      acc[current.pageId] = {
        visitorIds: [],
        entries: 0,
        visitors: 0,
        views: 0
      }
    }

    return {
      ...acc,
      [current.pageId]: {
        visitorIds: Array.from(
          new Set([...acc[current.pageId].visitorIds, current.puid])
        ),
        entries:
          current.destinationPageId === null
            ? acc[current.pageId].entries + 1
            : acc[current.pageId].entries,
        visitors: acc[current.pageId].visitorIds.length,
        views: acc[current.pageId].views + 1
      }
    }
  }, {})

  const languages = allRows.data.reduce(
    (acc, current) => {
      if (!acc.puids.includes(current.puid)) {
        Object.assign(acc, {
          [current.puid]: current.language,
          count: {
            ...acc.count,
            [current.language]: acc.count[current.language] + 1 || 1
          }
        })
        acc.puids.push(current.puid)
      }

      return acc
    },
    { puids: [], count: {} }
  )

  console.log(languages)

  return {
    props: {
      data: {
        totalPageViewsCount: allRows.count,
        uniqueVisitors: uniqueVisitorIds.size,
        content,
        languages
      }
    }
  }
}
