<script setup>

import {
  onMounted,
  onBeforeUnmount,
  ref
} from 'vue'

import {
  useRouter
} from 'vue-router'


const router =
  useRouter()


// ========================================
// PARTICLES
// ========================================

const particles =
  ref([])


let particleAnimation = null


function createParticles() {

  const items = []

  for (
    let i = 0;
    i < 55;
    i++
  ) {

    items.push({

      id: i,

      x:
        Math.random() * 100,

      y:
        Math.random() * 100,

      size:
        Math.random() * 3 + 1,

      delay:
        Math.random() * 6,

      duration:
        Math.random() * 5 + 5,

      opacity:
        Math.random() * 0.6 + 0.2

    })

  }

  particles.value =
    items

}


function goBack() {

  router.back()

}


function goDashboard() {

  router.replace({
    name: 'dashboard'
  })

}


onMounted(() => {

  createParticles()

})


onBeforeUnmount(() => {

  if (
    particleAnimation
  ) {

    cancelAnimationFrame(
      particleAnimation
    )

  }

})

</script>


<template>

  <div class="not-found-page">

    <!-- ================================= -->
    <!-- BACKGROUND -->
    <!-- ================================= -->

    <div class="space-background">

      <div class="grid-floor"></div>

      <div class="glow glow-one"></div>

      <div class="glow glow-two"></div>

      <div class="glow glow-three"></div>


      <!-- PARTICLES -->

      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="{
          left: particle.x + '%',
          top: particle.y + '%',
          width: particle.size + 'px',
          height: particle.size + 'px',
          opacity: particle.opacity,
          animationDelay: particle.delay + 's',
          animationDuration: particle.duration + 's'
        }"
      ></div>


      <!-- STAR LINES -->

      <span class="star star-one"></span>

      <span class="star star-two"></span>

      <span class="star star-three"></span>

      <span class="star star-four"></span>

      <span class="star star-five"></span>

    </div>


    <!-- ================================= -->
    <!-- MAIN -->
    <!-- ================================= -->

    <main class="not-found-content">


      <!-- ================================= -->
      <!-- PLANET / ORBIT -->
      <!-- ================================= -->

      <div class="planet-scene">

        <div class="orbit orbit-one"></div>

        <div class="orbit orbit-two"></div>

        <div class="planet">

          <div class="planet-crater crater-one"></div>

          <div class="planet-crater crater-two"></div>

          <div class="planet-crater crater-three"></div>

          <div class="planet-highlight"></div>

        </div>


        <!-- FLOATING SATELLITE -->

        <div class="satellite">

          <span class="satellite-body"></span>

          <span class="satellite-panel panel-left"></span>

          <span class="satellite-panel panel-right"></span>

          <span class="satellite-antenna"></span>

        </div>

      </div>


      <!-- ================================= -->
      <!-- 404 -->
      <!-- ================================= -->

      <div class="error-code">

        <span>4</span>

        <span class="zero">

          0

          <i class="bi bi-compass"></i>

        </span>

        <span>4</span>

      </div>


      <div class="error-label">

        PAGE NOT FOUND

      </div>


      <h1>

        Waduh, nyasar nih...

      </h1>


      <p>

        Halaman yang kamu cari sepertinya
        tersesat di luar angkasa.
        URL-nya mungkin salah atau halaman tersebut
        sudah tidak tersedia.

      </p>


      <!-- ================================= -->
      <!-- ACTIONS -->
      <!-- ================================= -->

      <div class="not-found-actions">

        <button
          type="button"
          class="btn-secondary"
          @click="goBack"
        >

          <i class="bi bi-arrow-left"></i>

          Kembali

        </button>


        <button
          type="button"
          class="btn-primary"
          @click="goDashboard"
        >

          <i class="bi bi-grid-1x2-fill"></i>

          Ke Dashboard

        </button>

      </div>


      <!-- ================================= -->
      <!-- FOOTER MESSAGE -->
      <!-- ================================= -->

      <div class="error-footer">

        <span class="status-dot"></span>

        SYSTEM STATUS

        <strong>
          ONLINE
        </strong>

      </div>

    </main>

  </div>

</template>


<style scoped>

/* ========================================
   PAGE
======================================== */

.not-found-page {

  position: relative;

  min-height: 20vh;

  width: 100%;

  overflow: hidden;

  display: flex;

  align-items: center;

  justify-content: center;

  background:
    var(--bg-main);

}


/* ========================================
   SPACE BACKGROUND
======================================== */

.space-background {

  position: absolute;

  inset: 0;

  overflow: hidden;

  pointer-events: none;

}


.space-background::before {

  content: '';

  position: absolute;

  inset: 0;

  background:

    radial-gradient(
      circle at 50% 42%,
      var(--accent-soft),
      transparent 24%
    ),

    radial-gradient(
      circle at 20% 20%,
      rgba(120, 120, 255, 0.06),
      transparent 25%
    ),

    radial-gradient(
      circle at 80% 75%,
      rgba(120, 120, 255, 0.05),
      transparent 28%
    );

}


/* ========================================
   GRID
======================================== */

.grid-floor {

  position: absolute;

  left: -20%;

  right: -20%;

  bottom: -45%;

  height: 75%;

  opacity: .16;

  transform:
    perspective(500px)
    rotateX(65deg);

  background-image:

    linear-gradient(
      var(--border-color) 1px,
      transparent 1px
    ),

    linear-gradient(
      90deg,
      var(--border-color) 1px,
      transparent 1px
    );

  background-size:
    45px 45px;

  mask-image:
    linear-gradient(
      to top,
      black,
      transparent
    );

}


/* ========================================
   GLOWS
======================================== */

.glow {

  position: absolute;

  border-radius: 50%;

  filter:
    blur(70px);

  pointer-events: none;

}


.glow-one {

  width: 260px;

  height: 260px;

  left: 5%;

  top: 15%;

  background:
    var(--accent-soft);

  opacity: .7;

}


.glow-two {

  width: 320px;

  height: 320px;

  right: 5%;

  bottom: 5%;

  background:
    var(--accent-soft);

  opacity: .5;

}


.glow-three {

  width: 180px;

  height: 180px;

  left: 48%;

  top: 20%;

  background:
    var(--accent-soft);

  opacity: .4;

}


/* ========================================
   PARTICLES
======================================== */

.particle {

  position: absolute;

  border-radius: 50%;

  background:
    var(--text-primary);

  box-shadow:
    0 0 8px
    var(--accent);

  animation:
    particleFloat
    ease-in-out
    infinite;

}


@keyframes particleFloat {

  0%,
  100% {

    transform:
      translateY(0)
      scale(1);

  }

  50% {

    transform:
      translateY(-22px)
      scale(1.4);

  }

}


/* ========================================
   STARS
======================================== */

.star {

  position: absolute;

  width: 2px;

  height: 2px;

  border-radius: 50%;

  background:
    var(--text-primary);

  box-shadow:
    0 0 8px
    var(--accent);

  animation:
    twinkle
    2.5s
    ease-in-out
    infinite;

}


.star-one {

  left: 12%;

  top: 28%;

}


.star-two {

  left: 82%;

  top: 24%;

  animation-delay:
    .8s;

}


.star-three {

  left: 72%;

  top: 68%;

  animation-delay:
    1.2s;

}


.star-four {

  left: 22%;

  top: 76%;

  animation-delay:
    1.7s;

}


.star-five {

  left: 91%;

  top: 48%;

  animation-delay:
    .4s;

}


@keyframes twinkle {

  0%,
  100% {

    opacity: .2;

    transform:
      scale(.8);

  }

  50% {

    opacity: 1;

    transform:
      scale(2);

  }

}


/* ========================================
   CONTENT
======================================== */

.not-found-content {

  position: relative;

  z-index: 10;

  width:
    min(620px, 92%);

  padding:
    30px;

  text-align:
    center;

}


/* ========================================
   PLANET SCENE
======================================== */

.planet-scene {

  position: relative;

  width: 180px;

  height: 180px;

  margin:
    0 auto 8px;

}


/* ========================================
   PLANET
======================================== */

.planet {

  position: absolute;

  width: 104px;

  height: 104px;

  left: 38px;

  top: 38px;

  border-radius: 50%;

  background:

    radial-gradient(
      circle at 35% 30%,
      var(--text-primary),
      var(--accent) 35%,
      color-mix(
        in srgb,
        var(--accent) 55%,
        black
      ) 75%,
      black
    );

  box-shadow:

    0 0 25px
    var(--accent-soft),

    0 0 70px
    var(--accent-soft);

  animation:
    planetFloat
    5s
    ease-in-out
    infinite;

}


@keyframes planetFloat {

  0%,
  100% {

    transform:
      translateY(0)
      rotate(-3deg);

  }

  50% {

    transform:
      translateY(-8px)
      rotate(3deg);

  }

}


/* ========================================
   CRATERS
======================================== */

.planet-crater {

  position: absolute;

  border-radius: 50%;

  background:
    rgba(0, 0, 0, .12);

}


.crater-one {

  width: 19px;

  height: 10px;

  left: 24px;

  top: 27px;

}


.crater-two {

  width: 12px;

  height: 7px;

  right: 20px;

  top: 47px;

}


.crater-three {

  width: 24px;

  height: 13px;

  left: 42px;

  bottom: 20px;

}


.planet-highlight {

  position: absolute;

  width: 35px;

  height: 35px;

  left: 14px;

  top: 12px;

  border-radius: 50%;

  background:
    rgba(255, 255, 255, .18);

  filter:
    blur(8px);

}


/* ========================================
   ORBITS
======================================== */

.orbit {

  position: absolute;

  border:
    1px solid
    var(--accent-soft);

  border-radius: 50%;

  transform:
    rotate(-20deg);

}


.orbit-one {

  width: 175px;

  height: 65px;

  left: 2px;

  top: 58px;

}


.orbit-two {

  width: 145px;

  height: 145px;

  left: 17px;

  top: 17px;

  border-style:
    dashed;

  opacity: .35;

}


/* ========================================
   SATELLITE
======================================== */

.satellite {

  position: absolute;

  width: 40px;

  height: 30px;

  right: 0;

  top: 17px;

  animation:
    satelliteFloat
    6s
    ease-in-out
    infinite;

}


@keyframes satelliteFloat {

  0%,
  100% {

    transform:
      translate(
        0,
        0
      )
      rotate(5deg);

  }

  50% {

    transform:
      translate(
        8px,
        -8px
      )
      rotate(-5deg);

  }

}


.satellite-body {

  position: absolute;

  width: 18px;

  height: 14px;

  left: 11px;

  top: 8px;

  border-radius: 4px;

  background:
    var(--text-secondary);

  border:
    1px solid
    var(--border-color);

}


.satellite-panel {

  position: absolute;

  width: 10px;

  height: 17px;

  top: 6px;

  background:
    var(--accent-soft);

  border:
    1px solid
    var(--accent);

}


.panel-left {

  left: 0;

}


.panel-right {

  right: 0;

}


.satellite-antenna {

  position: absolute;

  width: 2px;

  height: 8px;

  left: 19px;

  top: 0;

  background:
    var(--accent);

}


/* ========================================
   ERROR CODE
======================================== */

.error-code {

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  gap: 8px;

  margin-top:
    -8px;

  font-size:
    clamp(
      76px,
      13vw,
      132px
    );

  line-height:
    .85;

  font-weight:
    950;

  letter-spacing:
    -8px;

  color:
    var(--text-primary);

  text-shadow:
    0 0 35px
    var(--accent-soft);

}


.error-code > span {

  display:
    inline-block;

}


.error-code .zero {

  position: relative;

  color:
    var(--accent);

}


.zero i {

  position: absolute;

  left: 50%;

  top: 50%;

  transform:
    translate(
      -50%,
      -50%
    );

  font-size:
    .26em;

  color:
    var(--text-primary);

  animation:
    compassSpin
    7s
    linear
    infinite;

}


@keyframes compassSpin {

  to {

    transform:
      translate(
        -50%,
        -50%
      )
      rotate(360deg);

  }

}


/* ========================================
   LABEL
======================================== */

.error-label {

  display:
    inline-flex;

  padding:
    6px 11px;

  border:
    1px solid
    var(--border-color);

  border-radius:
    999px;

  background:
    var(--bg-card);

  color:
    var(--accent);

  font-size:
    9px;

  font-weight:
    900;

  letter-spacing:
    2px;

}


/* ========================================
   TEXT
======================================== */

h1 {

  margin:
    16px 0 8px;

  color:
    var(--text-primary);

  font-size:
    24px;

  font-weight:
    850;

}


p {

  width:
    min(460px, 100%);

  margin:
    0 auto;

  color:
    var(--text-muted);

  font-size:
    13px;

  line-height:
    1.8;

}


/* ========================================
   ACTIONS
======================================== */

.not-found-actions {

  display:
    flex;

  justify-content:
    center;

  gap:
    10px;

  margin-top:
    25px;

}


.not-found-actions button {

  min-width:
    130px;

  height:
    42px;

  padding:
    0 17px;

  display:
    inline-flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    8px;

  border:
    1px solid
    var(--border-color);

  border-radius:
    11px;

  cursor:
    pointer;

  font-size:
    12px;

  font-weight:
    750;

  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;

}


.not-found-actions button:hover {

  transform:
    translateY(-2px);

}


.btn-secondary {

  background:
    var(--bg-card);

  color:
    var(--text-secondary);

}


.btn-secondary:hover {

  border-color:
    var(--accent);

  color:
    var(--accent);

}


.btn-primary {

  border-color:
    var(--accent) !important;

  background:
    var(--accent);

  color:
    white;

  box-shadow:
    0 8px 25px
    var(--accent-soft);

}


/* ========================================
   SYSTEM STATUS
======================================== */

.error-footer {

  margin-top:
    26px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    6px;

  color:
    var(--text-muted);

  font-size:
    9px;

  font-weight:
    700;

  letter-spacing:
    1px;

}


.error-footer strong {

  color:
    var(--accent);

}


.status-dot {

  width:
    6px;

  height:
    6px;

  border-radius:
    50%;

  background:
    var(--accent);

  box-shadow:
    0 0 10px
    var(--accent);

  animation:
    statusPulse
    1.8s
    ease-in-out
    infinite;

}


@keyframes statusPulse {

  0%,
  100% {

    opacity: .35;

    transform:
      scale(.8);

  }

  50% {

    opacity: 1;

    transform:
      scale(1.2);

  }

}


/* ========================================
   MOBILE
======================================== */

@media (max-width: 575.98px) {

  .not-found-content {

    padding:
      20px;

  }


  .planet-scene {

    transform:
      scale(.85);

    margin-bottom:
      -5px;

  }


  .error-code {

    letter-spacing:
      -5px;

  }


  h1 {

    font-size:
      20px;

  }


  p {

    font-size:
      12px;

  }


  .not-found-actions {

    flex-direction:
      column;

    width:
      min(280px, 100%);

    margin-left:
      auto;

    margin-right:
      auto;

  }


  .not-found-actions button {

    width:
      100%;

  }

}

</style>