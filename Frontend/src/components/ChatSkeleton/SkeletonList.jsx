import React from 'react'
import SkeletonMessage from './SkeletonMessage'
import { Box } from '@mui/material'

function SkeletonList() {
  return (
    <Box sx={{ p: 2 }}>
      <SkeletonMessage isOwn={false} />
      <SkeletonMessage isOwn={true} />
      <SkeletonMessage isOwn={false} />
      <SkeletonMessage isOwn={true} />
      <SkeletonMessage isOwn={false} />
      <SkeletonMessage isOwn={true} />
      <SkeletonMessage isOwn={false} />
      <SkeletonMessage isOwn={true} />
    </Box>
  )
}

export default SkeletonList