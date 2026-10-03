import { seedBrowserDatabase } from './seed'
export default async function setup() {
  await seedBrowserDatabase()
}
