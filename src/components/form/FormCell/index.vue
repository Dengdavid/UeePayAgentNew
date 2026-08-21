<template>
  <div class="form_cell" :class="{
    isBg:isBg,
    [type]:type,
  }"
  :style="{
    padding:typeof padding==='number'?padding+'px':padding,
    marginBottom:typeof margin==='number'?margin+'px':margin,
  }"
  >
    <div class="form_cell_title" v-if="title">
      <div class="form_cell_title_text">
        <h3>{{ title }}</h3>
        <p v-if="sub">{{ sub }}</p>
        <div class="linkBtn list-r-2" @click="isShow=!isShow" v-if="!isNotShow">
          <span>{{ isShow?'收起':'展开' }}</span>
          <Icon :type="isShow?'ios-arrow-up':'ios-arrow-down'" />
        </div>
      </div>
      <div class="form_cell_title_btn" v-if="$slots.btn">
        <slot name="btn"></slot>
      </div>
    </div>
    <div class="form_cell_content"
      :class="{
        isBg:isTop,
      }"
      :style="{
        marginTop:typeof margin==='number'?margin+'px':margin,
      }" v-if="$slots.default && isShow" >
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  sub: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'default',//bottomBorder primary
  },
  isBg: {
    type: Boolean,
    default: false,
  },
  isTop: {
    type: Boolean,
    default: false,
  },
  margin: {
    type: [String,Number],
    default: '10px',
  },
  padding: {
    type: [String,Number],
    default: 0,
  },
  isShowValue:{
    type: Boolean,
    default: true,
  },
  isNotShow:{
    type: Boolean,
    default: false,
  },
  isBorder:{
    type: Boolean,
    default: false,
  },
})
const isShow=ref(props.isShowValue)
</script>
<style lang="less" scoped>
.form_cell{
  .form_cell_title{
    display: flex;
    align-items: center;
    justify-content: space-between;
    .form_cell_title_text{
      display: flex;
      align-items:flex-end;
      gap:4px;
      .linkBtn{
        cursor: pointer;
        margin-left: 8px;
        color: var(--primary-color);
      }
      h3{
        font-size: 16px;
        font-weight: bold;
        position: relative;
      }
      p{
        font-size: 12px;
        opacity: 0.6;
      }
    }
    .form_cell_title_btn{
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
  &:last-child{
    margin-bottom:0 !important;
  }
  .form_cell_content{
    >*{
      &:last-child{
        margin-bottom: 0 !important;
      }
    }
  }
  &.default{
    .form_cell_title{
      .form_cell_title_text{
        h3{
          padding-left: 10px;
          &:after {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translate(0, -50%);
            height: var(--ui-size-16);
            width: var(--ui-size-3);
            border-radius: var(--ui-radius-xl);
            background: var(--primary-color);
          }
        }
      }
    }
  }
  &.isBorder{
    background: var(--ui-color-surface);
    padding:var(--ui-padding-16) !important;
    border-radius: var(--ui-radius-lg);
    border: var(--ui-border-subtle);
    >*{
      &:not(:last-child){
        margin-bottom:12px;
        border-bottom: 1px #eee solid;
        padding-bottom:12px;
      }
    }
    .form_cell_title{
      display: flex;
      align-items: center;
      h3{
        padding-left: 0;
        &:after {
          display: none;
        }
      }
    }
  }
}
&.bottomBorder{
  .form_cell_title{
    padding-bottom:10px;
    border-bottom: 1px var(--primary-color) solid;
  }
}
&.primary{
  .form_cell_title{
    padding: var(--ui-padding-8-12);
    background: #f3f7ff;
    border-radius:var(--ui-radius-6);
  }
}
.isBg{
  background-color: var(--ui-color-surface);
  border-radius: var(--ui-radius-lg);
}
</style>
