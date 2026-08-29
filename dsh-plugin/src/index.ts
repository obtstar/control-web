import type { Context } from '@deepseek-ai/cordis'

export const name = 'control-platform-integration'

export function apply(ctx: Context) {
  console.log('[control-platform] Control Web integration loaded!')
  
  ctx.effect(() => {
    console.log('[control-platform] Active - connecting to http://127.0.0.1:8765')
    return () => {
      console.log('[control-platform] Cleanup')
    }
  }, 'control-platform: lifecycle')
}
