<template>
  <UiPage ref="pageRef" :data="data" row-key="id"></UiPage>
</template>

<script setup>
import { computed, ref,reactive,nextTick } from 'vue'
import { useUserStore } from '@/utils/store.js'
const userStore = useUserStore()
import { getApi,postApi } from '@/utils/api.js'
import { message,confirm } from '@/utils/message.js'
import { isPhone } from '@/utils/device.js'
import { t } from '@/utils'
const pageRef=ref(null)
const data=reactive({
  apiUrl:'/user/exportTasks',
  buttonLoading:false,
  thead:[
    {
      label: t('download.taskName'),
      prop:'title',
      minWidth:320,
      wapType:'title'
    },
    {
      label: t('download.status'),
      prop:'status',
      width:120,
      formType:'dot',
      wapType:'status',
      options:{
        completed:{
          label: t('download.completed'),
          type:'success'
        },
        failed:{
          label: t('download.failed'),
          type:'error'
        },
        pending:{
          label: t('download.pending'),
          type:'warning'
        },
        processing:{
          label: t('download.processing'),
          type:'primary'
        },
        cancelled:{
          label: t('download.cancelled'),
          type:'default'
        },
      }
    },
    {
      label: t('download.count'),
      prop:'download_count',
      align:'center',
      width:100,
    },
    {
      label: t('download.createdAt'),
      prop:'created_at',
      align:'center',
      width:170,
    },
  ],
  actions:[
    {
      label: t('download.action'),
      click:(row)=>{
        downLoadTask(row)
      }
    },
  ]
})
//下载
const downLoadTask = (row) => {
  row.loading=true
  postApi('/user/exportTaskDownload',{
    id:row.id
  }).then(async (res)=>{
    //文件地址file_url,浏览器下载
    const link=document.createElement('a')
    link.href=res.file_url
    link.download=`${row.title}-${Date.now()}.${row.file_type}`
    link.click()
    setTimeout(()=>{
      message(t('download.success'))
      row.download_count++
      row.loading=false
    }, 500)
  }).catch(()=>{
    row.loading=false
  })
}
</script>

<style scoped lang="less">

</style>
