import { supabase } from 'lib/supabase'
import { PostgrestResponse } from '@supabase/supabase-js'
import styles from '../styles/Dashboard.module.css'
import { EventData } from 'lib/types'

export default function Dashboard({ data, error }) {
  if (data) {
    return <div>Hello from DashBoard {JSON.stringify(data)}</div>
  } else if (error) {
    return <div>{error.message}</div>
  } else {
    return <div>Neither nor!!!</div>
  }
}

export async function getServerSideProps({ req, res, query, preview }) {
  const { data, error } = await supabase
    .from<PostgrestResponse<EventData>>('events')
    .select()

  return {
    props: {
      data,
      error
    }
  }
}
