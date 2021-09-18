import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'
import { EventData } from '../../lib/types'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }
  const eventData: EventData = req.body

  try {
    const { error } = await supabase
      .from('events')
      .insert([eventData], { returning: 'minimal' })

    if (error) {
      console.error('ERROR IN HANDLE-EVENTS API ROUTE', error)
    }

    return res.status(201).send(null)
  } catch (err) {
    console.error(err)

    return res
      .status(500)
      .json({ message: 'Something went fatally wrong', error: err })
  }
}
