<template>
  <div class="container lists">
    <section>
      <h1>Dashboard</h1>
      hi {{ user.firstName }}
    </section>
  </div>
</template>

<script>
import Vue from 'vue';
import store from '../store';

export default Vue.extend({
  name: 'Home',
  data() {
    return {
      user: {},
    };
  },
  computed: {
    lists() {
      return store.state.lists.results;
    },
    query() {
      return store.state.lists.results;
    },
  },
  mounted() {
    this.user = {
      firstName: 'Dave',
      lastName: 'Berning',
      twitterHandle: '@daveberning',
    };
  },
});
</script>
