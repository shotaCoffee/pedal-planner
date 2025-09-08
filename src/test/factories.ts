import { faker } from '@faker-js/faker'
import { Effect, Board, Layout } from '../types'

export const createMockEffect = (overrides?: Partial<Effect>) => ({
  id: faker.string.uuid(),
  user_id: faker.string.uuid(),
  name: faker.commerce.productName(),
  width_mm: faker.number.int({ min: 50, max: 200 }),
  height_mm: faker.number.int({ min: 30, max: 150 }),
  memo: faker.lorem.sentence(),
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  ...overrides,
})

export const createMockBoard = (overrides?: Partial<Board>) => ({
  id: faker.string.uuid(),
  user_id: faker.string.uuid(),
  name: faker.commerce.productName() + ' Board',
  width_mm: faker.number.int({ min: 300, max: 800 }),
  height_mm: faker.number.int({ min: 200, max: 400 }),
  memo: faker.lorem.sentence(),
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  ...overrides,
})

export const createMockLayout = (overrides?: Partial<Layout>) => ({
  id: faker.string.uuid(),
  user_id: faker.string.uuid(),
  board_id: faker.string.uuid(),
  name: 'Layout ' + faker.number.int({ min: 1, max: 100 }),
  layout_data: {
    effects: [
      {
        id: faker.string.uuid(),
        x: faker.number.int({ min: 0, max: 500 }),
        y: faker.number.int({ min: 0, max: 300 }),
        rotation: 0,
      },
    ],
  },
  signal_chain_memo: faker.lorem.sentence(),
  general_memo: faker.lorem.sentence(),
  share_code: faker.string.alphanumeric(8).toUpperCase(),
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  ...overrides,
})