import { NextApiRequest, NextApiResponse } from 'next'

import got from 'got'
import lqip from 'lqip-modern'

import { isPreviewImageSupportEnabled } from '../../lib/config'
import { PreviewImage } from '../../lib/types'
import { supabase } from '../../lib/supabase'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }

  if (!isPreviewImageSupportEnabled) {
    return res.status(418).send({
      error: 'preview image support has been disabled for this deployment'
    })
  }

  const { url, id } = req.body

  const result = await createPreviewImage(url, id)

  res.setHeader(
    'Cache-Control',
    result.error
      ? 'public, s-maxage=60, max-age=60, stale-while-revalidate=60'
      : 'public, immutable, s-maxage=31536000, max-age=31536000, stale-while-revalidate=60'
  )
  res.status(200).json(result)
}

export async function createPreviewImage(
  url: string,
  id: string
): Promise<PreviewImage> {
  console.log('createPreviewImage lambda', { url, id })

  try {
    const { data, error } = await supabase
      .from('lqip_images')
      .select('dataURIBase64, type')
      .match({ id })

    if (data.length) {
      return data[0] as PreviewImage
    } else {
      const { body } = await got(url, { responseType: 'buffer' })
      const result = await lqip(body)

      const image = {
        id,
        url,
        originalWidth: result.metadata.originalWidth,
        originalHeight: result.metadata.originalHeight,
        width: result.metadata.width,
        height: result.metadata.height,
        type: result.metadata.type,
        dataURIBase64: result.metadata.dataURIBase64
      }
      await supabase.from('lqip_images').insert([image])

      return image
    }
  } catch (err) {
    console.error('lqip error', err)
    const error: any = {
      url,
      error: err.message || 'unknown error'
    }

    return error
  }
}
