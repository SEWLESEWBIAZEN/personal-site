import React from 'react'
import { Button } from './ui/button'
import { NothingPageProps } from '@/lib/interfaces'

const Nothing = ({content,clearFunc}:NothingPageProps) => {
  return (
    <div className="text-center py-16" aria-live="polite">
                <p className="text-muted-foreground">No {content} found matching your search criteria.</p>
                <Button
                  variant="link"
                  onClick={clearFunc}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              </div>
  )
}

export default Nothing