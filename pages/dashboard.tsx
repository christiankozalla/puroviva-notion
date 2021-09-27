import { PostgrestError } from '@supabase/postgrest-js'
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

interface Data {
  totalPageViewsCount: number
  uniqueVisitors: number
  uniquePuids: string[]
  content: Content
  languages: {
    [n: string]: number
  }
  mobile: number
}

export default function Dashboard({
  data,
  error,
  time
}: {
  data: Data
  error: PostgrestError
  time: string
}) {
  if (data) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <h1 className={styles.headline}>Puroviva Analytics Dashboard</h1>
          <div className={styles.date}>Current date: {time.split('T')[0]}</div>
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
              <span></span>
              <span></span>
              <div>Visitors</div>
            </div>
            {Object.entries(data.languages).map(([language, count]) => (
              <div className={styles.row} key={language}>
                <div>{language}</div>
                <span></span>
                <span></span>
                <div>{count}</div>
              </div>
            ))}
            <div className={styles.row}>
              <div>Total visitors</div>
              <span></span>
              <span></span>
              <div>{data.uniquePuids.length}</div>
            </div>
          </div>
          <div className={styles.table}>
            <div className={styles.row}>
              <div>Devices</div>
              <span></span>
              <span></span>
              <div>Visistors</div>
            </div>
            <div className={styles.row}>
              <div>Mobile</div>
              <span></span>
              <span></span>
              <div>{data.mobile}</div>
            </div>
            <div className={styles.row}>
              <div>Desktop</div>
              <span></span>
              <span></span>
              <div>{data.uniquePuids.length - data.mobile}</div>
            </div>
            <div className={styles.row}>
              <div>Total visitors</div>
              <span></span>
              <span></span>
              <div>{data.uniquePuids.length}</div>
            </div>
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

  /* Table "Languages" displays the language (browser settings) for each unique visitor */
  /* Table "Devices" displays the mobile count (true if screen width <= 450px) for each unique visitor */
  const { uniquePuids, languages, mobile } = allRows.data.reduce(
    (acc, current) => {
      if (!acc.uniquePuids.includes(current.puid)) {
        Object.assign(acc, {
          languages: {
            ...acc.languages,
            [current.language]: acc.languages[current.language] + 1 || 1
          },
          mobile: current.isMobile === true ? acc.mobile + 1 : acc.mobile
        })

        acc.uniquePuids.push(current.puid)
      }

      return acc
    },
    { uniquePuids: [], languages: {}, mobile: 0 }
  )

  return {
    props: {
      data: {
        totalPageViewsCount: allRows.count,
        uniqueVisitors: uniqueVisitorIds.size,
        content,
        languages,
        mobile,
        uniquePuids
      },
      time: new Date().toISOString()
    }
  }
}
