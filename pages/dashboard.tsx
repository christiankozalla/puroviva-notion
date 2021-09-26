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
    return <div>Hello from DashBoard {JSON.stringify(data, null, 2)}</div>
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

  return {
    props: {
      data: {
        totalPageViewsCount: allRows.count,
        uniqueVisitors: uniqueVisitorIds.size,
        content
      }
    }
  }
}
