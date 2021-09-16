import crypto from 'crypto'
import got from 'got'
import pMap from 'p-map'

import { api, isPreviewImageSupportEnabled } from './config'
import { PreviewImage, PreviewImageMap } from './types'
import { supabase } from './supabase'

function sha256(input: Buffer | string) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

export async function getPreviewImages(
  images: string[]
): Promise<PreviewImageMap> {
  if (!isPreviewImageSupportEnabled) {
    return {}
  }

  const imageIds: Array<{ url: string; id: string }> = images.map((url) => {
    return { url, id: sha256(url) }
  })

  if (!imageIds.length) {
    return {}
  }

  const imageData = await Promise.all(
    imageIds.map(async ({ url, id }) => {
      return {
        id,
        url,
        ...(await supabase
          .from(process.env.NEXT_PUBLIC_SUPABASE_IMAGES)
          .select('id, dataURIBase64, url, type, width, height')
          .match({ id }))
      }
    })
  )

  const results = await pMap(imageData, async ({ id, url, error, data }) => {
    if (!data.length) {
      const json = {
        url,
        id
      }
      console.log('createPreviewImage server-side', json)
      return got
        .post(api.createPreviewImage, { json })
        .json() as Promise<PreviewImage>
    } else {
      return data[0] as PreviewImage
    }
  })

  return results.filter(Boolean).reduce(
    (acc, result) => ({
      ...acc,
      [result.url]: result
    }),
    {}
  )
}
