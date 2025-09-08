import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, userEvent, act } from '@/test/utils/test-utils'
import { ToastProvider, useToast } from '@/components/Toast'

// Test component to interact with Toast context
function TestComponent() {
  const { addToast } = useToast()
  
  return (
    <div>
      <button onClick={() => addToast('Success message', 'success')}>
        Add Success
      </button>
      <button onClick={() => addToast('Error message', 'error')}>
        Add Error
      </button>
    </div>
  )
}

describe('Toast System', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should render success toast with correct message', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    const successButton = screen.getByText('Add Success')
    await user.click(successButton)
    
    expect(screen.getByText('Success message')).toBeInTheDocument()
    
    // Find the toast container (parent of the text that has bg-green-500)
    const toastElement = screen.getByText('Success message').parentElement?.parentElement
    expect(toastElement).toHaveClass('bg-green-500')
  })

  it('should render error toast with correct message', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    const errorButton = screen.getByText('Add Error')
    await user.click(errorButton)
    
    expect(screen.getByText('Error message')).toBeInTheDocument()
    
    // Find the toast container (parent of the text that has bg-red-500)
    const toastElement = screen.getByText('Error message').parentElement?.parentElement
    expect(toastElement).toHaveClass('bg-red-500')
  })

  it('should remove toast when close button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    const successButton = screen.getByText('Add Success')
    await user.click(successButton)
    
    expect(screen.getByText('Success message')).toBeInTheDocument()
    
    const closeButton = screen.getByText('×')
    await user.click(closeButton)
    
    expect(screen.queryByText('Success message')).not.toBeInTheDocument()
  })

  it('should auto-dismiss toast after 5 seconds', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    const successButton = screen.getByText('Add Success')
    await user.click(successButton)
    
    expect(screen.getByText('Success message')).toBeInTheDocument()
    
    // Fast-forward time by 5 seconds with act
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    
    expect(screen.queryByText('Success message')).not.toBeInTheDocument()
  })
})