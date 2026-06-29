import { useEffect } from "react"
import { useThemeCreatorActions } from "@/store/mui-theme-creator/store"

export const useSwitchToTab = (tabName: string) => {
  const { setActiveTab } = useThemeCreatorActions()
  useEffect(() => {
    setActiveTab(tabName)
  }, [setActiveTab, tabName])
}
