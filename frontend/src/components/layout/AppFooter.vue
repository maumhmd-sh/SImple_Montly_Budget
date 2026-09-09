<template>

  <footer class="app-footer">

    <div>

      <strong>
        Monthly Budget
      </strong>

      <span>
        · Personal Finance Dashboard
      </span>

    </div>

    <div>

      © 2025

    </div>

  </footer>

</template>


<style scoped>

.app-footer {

  min-height: 54px;

  padding:
    0 28px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  border-top:
    1px solid var(--border-color);

  color:
    var(--text-muted);

  font-size: 11px;

}


.app-footer strong {

  color:
    var(--accent);

}


.app-footer span {

  margin-left: 4px;

}


@media (max-width: 575px) {

  .app-footer {

    padding:
      0 15px;

  }

}

</style>