<template>
  <div class="pageLogin">
    <div class="pageLogin-preferences">
      <GlobalPreferences />
    </div>
    <section class="pageLogin-visual">
      <LightDotRise
        class="pageLogin-starlight"
        :count="22"
        :simultaneous="2"
        :speed="1.1"
        :size="3"
        :spread="220"
        :start-top="70"
        :start-range="6"
      />
      <LogoBox class="pageLogin-logo" />
      <div class="pageLogin-slogan">
        <h2>
          <span>{{ $t('pageLogin.hero.global') }}</span>{{ $t('pageLogin.hero.wordSeparator') }}{{ $t('pageLogin.hero.cardServices') }}
          <br />{{ $t('pageLogin.hero.crossBorder') }}{{ $t('pageLogin.hero.wordSeparator') }}<span>{{ $t('pageLogin.hero.payments') }}</span>
        </h2>
        <p>{{ $t('pageLogin.hero.description') }}</p>
      </div>
      <p class="pageLogin-tagline">{{ $t('pageLogin.hero.tagline') }}</p>
    </section>
    <main class="pageLogin-content">
      <div class="pageLogin-box">
        <div class="pageLogin-title">
          <h1 class="title">{{ title }}</h1>
        </div>
        <div class="pageLogin-form">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouteQuery } from '@/utils/route.js'
import { t } from '@/utils/index.js'
import GlobalPreferences from '@/components/layout/GlobalPreferences.vue'
import LightDotRise from './LightDotRise.vue'
import LogoBox from '@/views/components/LogoBox/index.vue'

const query = useRouteQuery()

defineProps({
  title: {
    type: String,
    default: () => t('pageLogin.defaultTitle')
  }
})

onMounted(() => {
  const inviteCode = query?.invite_code
  if (inviteCode) {
    localStorage.setItem('invite_code', inviteCode)
  }
})
</script>

<style scoped lang="less">
.pageLogin {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 62%) minmax(0, 38%);
  overflow: hidden;
  background: #fff;

  .pageLogin-preferences {
    position: absolute;
    z-index: 10;
    top: 20px;
    right: 24px;
    display: flex;
  }

  .pageLogin-visual {
    min-height: 100vh;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    padding: 42px 56px 48px;
    overflow: hidden;
    background: #f7f7fc url('@/assets/images/login_visual_v4.jpg') no-repeat top center;
    background-size: cover;
    isolation: isolate;

    .pageLogin-logo,
    .pageLogin-slogan,
    .pageLogin-tagline {
      position: relative;
      z-index: 1;
    }

    .pageLogin-logo {
      width: fit-content;
      padding: 0;
      border: 0;
      background: transparent;
      cursor: pointer;
      width: 166px;
    }

    .pageLogin-slogan {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 54px 24px 16px;
      margin: 0 auto;
      h2 {
        color: var(--ui-color-text);
        font-size: clamp(30px, 2.6vw, 44px);
        font-weight:700;
        line-height: 1.28;
        font-size:56px;

        span {
          color: var(--ui-color-primary);
        }
      }

      > p {
        margin-top: 12px;
        color: #66758d;
        font-size: 16px;
      }
    }

    .pageLogin-tagline {
      margin: 0;
      color: #43516a;
      font-size: 15px;
      text-align: center;
    }
  }
  .pageLogin-content {
    min-height: 100vh;
    padding: 48px 56px;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    .pageLogin-box {
      width: 100%;
      max-width:460px;
      display: flex;
      flex-direction: column;
      gap: 32px;

      .pageLogin-title {
        text-align: center;

        .title {
          color: var(--ui-color-text);
          font-size: 28px;
          font-weight: 600;
          line-height: 1.4;
        }

        p {
          margin-top: 8px;
          color: var(--ui-color-text-muted);
          font-size: 13px;
        }
      }
    }
  }

  @media (max-width: 1000px) {
    .pageLogin-visual {
      padding: 28px;

      .pageLogin-slogan {
        padding-right: 12px;
        padding-left: 12px;

        > p {
          font-size: 14px;
        }
      }
    }

    .pageLogin-content {
      padding: 36px 24px;
    }
  }

  @media (min-width: 768px) and (max-height: 1050px) {
    .pageLogin-visual {
      padding: 32px 44px 36px;
      background-image:
        linear-gradient(to bottom, #f7f7fc 0, rgba(247, 247, 252, 0.94) 72px, rgba(247, 247, 252, 0) 220px),
        url('@/assets/images/login_visual_v4.jpg');
      background-position: center top, center calc(100% + 72px);
      background-size: 100% 220px, cover;

      .pageLogin-logo {
        width: var(--ui-size-150);
      }

      .pageLogin-slogan {
        padding: 32px 16px 12px;

        h2 {
          font-size: 44px;
        }

        > p {
          margin-top: 8px;
          font-size: 14px;
        }
      }

      .pageLogin-tagline {
        font-size: 13px;
      }
    }
  }

  @media (min-width: 768px) and (max-height: 700px) {
    .pageLogin-visual {
      padding: 20px 32px;
      background-position: center top, center calc(100% + 56px);

      .pageLogin-logo {
        width: 132px;
      }

      .pageLogin-slogan {
        padding: 18px 8px 8px;

        h2 {
          font-size: 38px;
        }

        > p {
          margin-top: 6px;
          font-size: 12px;
        }
      }

      .pageLogin-tagline {
        font-size: 12px;
      }
    }
  }

  @media (max-width: 767px) {
    display: block;
    min-height: 100vh;
    overflow: visible;

    .pageLogin-preferences {
      top: 22px;
      right: 16px;
    }

    .pageLogin-visual {
      min-height: auto;
      padding: 24px 20px;
      background-position: top center;

      .pageLogin-starlight {
        display: none;
      }

      .pageLogin-logo{
        width: 120px;
      }

      .pageLogin-slogan,
      .pageLogin-tagline {
        display: none;
      }
    }

    .pageLogin-content {
      min-height: calc(100vh - 76px);
      padding: 32px 20px 48px;
      align-items: flex-start;

      .pageLogin-box {
        max-width: 460px;
        gap: 28px;
      }
    }

    .pageLogin-visual {
      border-radius: 0;
      box-shadow: 0 6px 18px rgba(43, 92, 217, 0.04);
    }
  }

}
</style>
