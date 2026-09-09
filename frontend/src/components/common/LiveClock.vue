<script setup>

import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'


const now = ref(
  new Date()
)


let timer = null


onMounted(() => {

  timer = setInterval(() => {

    now.value = new Date()

  }, 1000)

})


onBeforeUnmount(() => {

  clearInterval(timer)

})


const dayName = computed(() => {

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      weekday: 'long'
    }
  ).format(now.value)

})


const fullDate = computed(() => {

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }
  ).format(now.value)

})


const time = computed(() => {

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }
  ).format(now.value)

})

</script>


<template>

  <div class="live-clock">

    <div class="live-clock-date">

      <i class="bi bi-calendar3"></i>

      <span>
        {{ dayName }}, {{ fullDate }}
      </span>

    </div>

    <div class="live-clock-time">

      <i class="bi bi-clock"></i>

      <span>
        {{ time }} WIB
      </span>

    </div>

  </div>

</template>


<style scoped>

.live-clock {

  display: flex;

  align-items: center;

  gap: 18px;

  color:
    var(--text-secondary);

  font-size: 13px;

}


.live-clock-date,
.live-clock-time {

  display: flex;

  align-items: center;

  gap: 7px;

}


.live-clock i {

  color:
    var(--accent);

}


.live-clock-time {

  font-weight: 700;

  color:
    var(--text-primary);

}


@media (max-width: 767px) {

  .live-clock-date {

    display: none;

  }

}

</style>