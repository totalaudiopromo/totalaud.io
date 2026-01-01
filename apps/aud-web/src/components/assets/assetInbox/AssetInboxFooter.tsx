'use client'

import { flowCoreColours } from '@aud-web/constants/flowCoreColours'

interface AssetInboxFooterProps {
  count: number
}

export function AssetInboxFooter({ count }: AssetInboxFooterProps) {
  return (
    <div
      style={{
        padding: '16px 24px',
        borderTop: `1px solid ${flowCoreColours.borderGrey}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: flowCoreColours.textTertiary,
      }}
    >
      <span>
        {count} asset{count === 1 ? '' : 's'}
      </span>
      <span>
        <kbd
          style={{
            padding: '2px 6px',
            backgroundColor: flowCoreColours.matteBlack,
            border: `1px solid ${flowCoreColours.borderGrey}`,
            borderRadius: '3px',
            fontSize: '10px',
            fontFamily: 'monospace',
          }}
        >
          Cmd+U
        </kbd>{' '}
        to close
      </span>
    </div>
  )
}
