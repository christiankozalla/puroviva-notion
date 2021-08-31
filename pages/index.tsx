import React, { useEffect } from 'react'
import { domain } from 'lib/config'
import { resolveNotionPage } from 'lib/resolve-notion-page'
import { NotionPage } from 'components'

import { logEvent } from 'firebase/analytics'
import { firebaseAnalytics } from 'lib/firebase'

export const getStaticProps = async () => {
  try {
    const props = await resolveNotionPage(domain)

    return { props, revalidate: 10 }
  } catch (err) {
    console.error('page error', domain, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

export default function NotionDomainPage(props) {
  useEffect(() => {
    logEvent(firebaseAnalytics, 'home_page_visited')
  }, [])

  return <NotionPage {...props} />
}
