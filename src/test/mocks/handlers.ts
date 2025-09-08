import { http, HttpResponse } from 'msw'
import { createMockEffect, createMockBoard, createMockLayout } from '../factories'

export const handlers = [
  // Effects API
  http.get('/api/effects', () => {
    return HttpResponse.json([
      createMockEffect({ name: 'Boss DS-1' }),
      createMockEffect({ name: 'Ibanez Tube Screamer' }),
      createMockEffect({ name: 'Big Muff Pi' }),
    ])
  }),

  http.post('/api/effects', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(createMockEffect(body), { status: 201 })
  }),

  http.put('/api/effects/:id', async ({ request, params }) => {
    const body = await request.json()
    return HttpResponse.json(createMockEffect({ id: params.id, ...body }))
  }),

  http.delete('/api/effects/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, deleted: true })
  }),

  // Boards API
  http.get('/api/boards', () => {
    return HttpResponse.json([
      createMockBoard({ name: 'Pedaltrain Classic 2' }),
      createMockBoard({ name: 'Boss BCB-60' }),
    ])
  }),

  http.post('/api/boards', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(createMockBoard(body), { status: 201 })
  }),

  http.put('/api/boards/:id', async ({ request, params }) => {
    const body = await request.json()
    return HttpResponse.json(createMockBoard({ id: params.id, ...body }))
  }),

  http.delete('/api/boards/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, deleted: true })
  }),

  // Layouts API
  http.get('/api/layouts', () => {
    return HttpResponse.json([
      createMockLayout({ name: 'Blues Setup' }),
      createMockLayout({ name: 'Rock Setup' }),
    ])
  }),

  http.post('/api/layouts', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(createMockLayout(body), { status: 201 })
  }),

  http.get('/api/layouts/:id', ({ params }) => {
    return HttpResponse.json(createMockLayout({ id: params.id }))
  }),

  http.put('/api/layouts/:id', async ({ request, params }) => {
    const body = await request.json()
    return HttpResponse.json(createMockLayout({ id: params.id, ...body }))
  }),

  http.delete('/api/layouts/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, deleted: true })
  }),

  http.get('/api/layouts/share-code', ({ request }) => {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    if (!code) {
      return HttpResponse.json({ error: 'Share code required' }, { status: 400 })
    }
    return HttpResponse.json(createMockLayout({ share_code: code }))
  }),
]