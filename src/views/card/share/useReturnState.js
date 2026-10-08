import { watch } from 'vue'
import { useRouter } from '@/utils/route'
import { useUserStoreRefs } from '@/utils/store'

const states = { tabs: {}, list: {}, record: {}, bill: {}, wallets: {} }
const routeNames = new Set(['sharedCard', 'cardSharedWallets', 'cardSharedWalletAdd', 'cardSharedWalletEdit', 'cardSharedWalletDetail', 'sharedCardAdd', 'sharedCardDetail'])
const clear = () => Object.keys(states).forEach(key => { states[key] = {} })
let installed = false

export const useReturnState = () => {
  const router = useRouter()
  const { user } = useUserStoreRefs()
  watch(() => user.value?.id, clear, { flush: 'sync' })
  if (!installed) {
    let userId = user.value?.id
    router.afterEach((to, from, failure) => {
      if (failure) return
      if (!routeNames.has(to.name) || userId !== user.value?.id) clear()
      userId = user.value?.id
    })
    installed = true
  }
  return states
}
