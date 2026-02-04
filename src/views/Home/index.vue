<script setup lang="ts">
import { storeToRefs } from 'pinia'
import ImageSync from '@/components/ImageSync/index.vue'
import useStore from '@/store'
import HeaderTitle from './components/HeaderTitle/index.vue'
import OptionButton from './components/OptionsButton/index.vue'
import PrizeList from './components/PrizeList/index.vue'
import StarsBackground from './components/StarsBackground/index.vue'
import { useViewModel } from './useViewModel'
import 'vue-toast-notification/dist/theme-sugar.css'

const viewModel = useViewModel()
const { setDefaultPersonList, tableData, currentStatus, enterLottery, stopLottery, containerRef, startLottery, continueLottery, quitLottery, isInitialDone, titleFont, titleFontSyncGlobal, currentPrize, showPrizeName } = viewModel
const globalConfig = useStore().globalConfig

const { getTopTitle: topTitle, getTextColor: textColor, getTextSize: textSize, getBackground: homeBackground } = storeToRefs(globalConfig)
</script>

<template>
  <HeaderTitle
    :table-data="tableData"
    :text-size="textSize"
    :text-color="textColor"
    :top-title="topTitle"
    :set-default-person-list="setDefaultPersonList"
    :is-initial-done="isInitialDone"
    :title-font="titleFont"
    :title-font-sync-global="titleFontSyncGlobal"
  />
  <div id="container" ref="containerRef" class="3dContainer">
    <OptionButton
      :current-status="currentStatus"
      :table-data="tableData"
      :enter-lottery="enterLottery"
      :start-lottery="startLottery"
      :stop-lottery="stopLottery"
      :continue-lottery="continueLottery"
      :quit-lottery="quitLottery"
    />
  </div>
  <transition name="prize-display">
    <div v-if="showPrizeName && currentPrize" class="prize-display-container">
      <div class="prize-display-card">
        <figure class="prize-image-container">
          <ImageSync v-if="currentPrize.picture.url" :img-item="currentPrize.picture" />
          <img
            v-else src="@/assets/images/龙.png" alt="Prize"
            class="prize-image"
          >
        </figure>
        <div class="prize-info">
          <h2 class="prize-name">
            {{ currentPrize.name }}
          </h2>
        </div>
      </div>
    </div>
  </transition>
  <StarsBackground :home-background="homeBackground" />
  <PrizeList class="absolute left-0 top-32" />
</template>

<style scoped lang="scss">
.prize-display-container {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  pointer-events: none;
}

.prize-display-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.prize-image-container {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prize-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.prize-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prize-name {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.prize-display-enter-active {
  animation: slide-down 0.5s ease-out;
}

.prize-display-leave-active {
  transition: opacity 0.1s ease-in, transform 0.1s ease-in;
  opacity: 0;
  transform: translate(-50%, -20px);
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>
