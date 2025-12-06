import React from 'react'
import { Stack, Skeleton } from '@mui/material'

function ChatLoading() {
  return (
    <>
        <Stack spacing={1}>
            <Skeleton variant="rectangular" width={"100%"} height={50} />
            <Skeleton variant="rectangular" width={"100%"} height={50} />
            <Skeleton variant="rectangular" width={"100%"} height={50} />
            <Skeleton variant="rectangular" width={"100%"} height={50} />
            <Skeleton variant="rectangular" width={"100%"} height={50} />
            <Skeleton variant="rectangular" width={"100%"} height={50} />
            <Skeleton variant="rectangular" width={"100%"} height={50} />
        </Stack>
    </>
  )
}

export default ChatLoading