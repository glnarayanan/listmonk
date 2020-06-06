<template>
  <section class="subscribers">
    <header class="columns">
      <div class="column is-half">
        <h1 class="title is-4">Subscribers
            <span v-if="subscribers.total > 0">({{ subscribers.total }})</span>
        </h1>
      </div>
      <div class="column has-text-right">
        <b-button type="is-primary" icon-left="plus" @click="showNewForm">Add new</b-button>
      </div>
    </header>

    <section class="subscribers-controls columns">
      <div class="column is-4">
        <form @submit.prevent="querySubscribers">
          <div>
            <b-field grouped>
              <b-input v-model="queryParams.query"
                placeholder="E-mail or name" icon="magnify" ref="query"
                :disabled="isSearchAdvanced"></b-input>
              <b-button native-type="submit" type="is-primary" icon-left="magnify"
                :disabled="isSearchAdvanced"></b-button>
            </b-field>

            <p>
              <a href="#" @click.prevent="toggleAdvancedSearch">
                <b-icon icon="cog-outline" size="is-small" /> Advanced</a>
            </p>

            <div v-if="isSearchAdvanced">
              <b-field>
                <b-input v-model="queryParams.fullQuery"
                  type="textarea" ref="fullQuery"
                  placeholder="subscribers.name LIKE '%user%' or subscribers.status='blacklisted'">
                </b-input>
              </b-field>
              <b-field>
                <span class="is-size-6 has-text-grey">
                  Partial SQL expression to query subscriber attributes.{{ ' ' }}
                  <a href="https://listmonk.app/docs/querying-and-segmentation"
                    target="_blank" rel="noopener noreferrer">
                    Learn more <b-icon icon="link" size="is-small" />.
                  </a>
                </span>
              </b-field>

              <div class="buttons">
                <b-button native-type="submit" type="is-primary"
                  icon-left="magnify">Query</b-button>
                <b-button @click.prevent="toggleAdvancedSearch" icon-left="close">Reset</b-button>
              </div>
            </div><!-- advanced query -->
          </div>
        </form>
      </div><!-- search -->

      <div class="column is-4 subscribers-bulk" v-if="bulk.checked.length > 0">
        <div>
          <p>
            <span class="is-size-5 has-text-weight-semibold">
              {{ numSelectedSubscribers }} subscriber(s) selected
            </span>
            <span v-if="!bulk.all && subscribers.total > subscribers.perPage">
              &mdash; <a href="" @click.prevent="selectAllSubscribers">
                Select all {{ subscribers.total }}</a>
            </span>
          </p>

          <p class="actions">
            <a href='' @click.prevent="showBulkListForm">
              <b-icon icon="format-list-bulleted-square" size="is-small" /> Manage lists
            </a>

            <a href='' @click.prevent="deleteSubscribers">
              <b-icon icon="trash-can-outline" size="is-small" /> Delete
            </a>

            <a href='' @click.prevent="blacklistSubscribers">
              <b-icon icon="account-off-outline" size="is-small" /> Blacklist
            </a>
          </p><!-- selection actions //-->
        </div>
      </div>
    </section><!-- control -->

    <b-table
      :data="subscribers.results"
      :hoverable="true"
      :loading="loading.subscribers"
      :backend-sorting="true"
      :paginated="true"
      :checked-rows.sync="bulk.checked"
      @sort="sortSubscribers" @check-all="onTableCheck" @check="onTableCheck"
      default-sort="createdAt"
      checkable>
        <template slot-scope="props">
            <b-table-column field="email" label="E-mail" sortable>
              <a :href="`/subscribers/${props.row.id}`"
                @click.prevent="showEditForm(props.row)">
                {{ props.row.email }}
              </a>
              <b-taglist>
                  <router-link :to="`/subscribers/lists/${props.row.id}`">
                    <b-tag :class="l.subscriptionStatus" v-for="l in props.row.lists" :key="l.id">
                        {{ l.name }} <sup>{{ l.subscriptionStatus }}</sup>
                    </b-tag>
                  </router-link>
              </b-taglist>
            </b-table-column>

            <b-table-column field="name" label="Name" sortable>
              <a :href="`/subscribers/${props.row.id}`"
                @click.prevent="showEditForm(props.row)">
                {{ props.row.name }}
              </a>
            </b-table-column>

            <b-table-column field="status" label="Status" sortable>
            <b-tag :class="props.row.status">
                <b-icon :icon="props.row.status === 'enabled' ?
                    'account-check-outline' : 'account-off-outline'"
                    size="is-small" /> {{ props.row.status }}
            </b-tag>
            </b-table-column>

            <b-table-column field="lists" label="Lists" sortable numeric centered>
              {{ listCount(props.row.lists) }}
            </b-table-column>

            <b-table-column field="createdAt" label="Created" sortable>
                {{ $utils.niceDate(props.row.createdAt) }}
            </b-table-column>

            <b-table-column field="updatedAt" label="Updated" sortable>
                {{ $utils.niceDate(props.row.updatedAt) }}
            </b-table-column>

            <b-table-column class="actions">
              <router-link :to="{'name': 'campaign'}">
                <b-tooltip label="Download data" type="is-dark">
                  <b-icon icon="cloud-download-outline" size="is-small" />
                </b-tooltip>
              </router-link>
              <a :href="`/subscribers/${props.row.id}`"
                @click.prevent="showEditForm(props.row)">
                <b-tooltip label="Edit" type="is-dark">
                  <b-icon icon="pencil-outline" size="is-small" />
                </b-tooltip>
              </a>
              <a href='' @click.prevent="deleteSubscriber(props.row)">
                <b-tooltip label="Delete" type="is-dark">
                  <b-icon icon="trash-can-outline" size="is-small" />
                </b-tooltip>
              </a>
            </b-table-column>
        </template>
        <template slot="empty" v-if="!loading.subscribers">
            <section class="section">
                <div class="content has-text-grey has-text-centered">
                    <p>
                        <b-icon icon="plus" size="is-large" />
                    </p>
                    <p>No subscribers. Start by adding one.</p>
                </div>
            </section>
        </template>
    </b-table>

    <!-- Manage list modal -->
    <b-modal scroll="keep" :aria-modal="true" :active.sync="isBulkListFormVisible" :width="450">
      <subscriber-bulk-list :numSubscribers="this.numSelectedSubscribers"
        @finished="bulkChangeLists" />
    </b-modal>

    <!-- Add / edit form modal -->
    <b-modal scroll="keep" :aria-modal="true" :active.sync="isFormVisible" :width="750">
      <subscriber-form :data="curItem" :isEditing="isEditing"
        @finished="querySubscribers"></subscriber-form>
    </b-modal>
  </section>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import SubscriberForm from './SubscriberForm.vue';
import SubscriberBulkList from './SubscriberBulkList.vue';

Vue.component('subscriber-form', SubscriberForm);
Vue.component('subscriber-bulk-list', SubscriberBulkList);

export default Vue.extend({
  components: {
    SubscriberForm,
  },

  data() {
    return {
      // Current subscriber item being edited.
      curItem: null,
      isSearchAdvanced: false,
      isEditing: false,
      isFormVisible: false,
      isBulkListFormVisible: false,

      // Table bulk row selection states.
      bulk: {
        checked: [],
        all: false,
      },

      // Query params to filter the getSubscribers() API call.
      queryParams: {
        // Simple query field.
        query: '',

        // Advanced query filled. This value should be accessed via fullQueryExp().
        fullQuery: '',

        listIDs: [],
        page: 1,
        perPage: 20,
      },
    };
  },

  methods: {
    // Count the lists from which a subscriber has not unsubscribed.
    listCount(lists) {
      return lists.reduce((defVal, item) => (defVal + item.status !== 'unsubscribed' ? 1 : 0), 0);
    },

    toggleAdvancedSearch() {
      this.isSearchAdvanced = !this.isSearchAdvanced;

      // Toggling to simple search.
      if (!this.isSearchAdvanced) {
        this.$nextTick(() => {
          this.$refs.query.focus();
        });
        return;
      }

      // Toggling to advanced search.
      this.$nextTick(() => {
        // Turn the string in the simple query input into an SQL exprssion and
        // show in the full query input.
        if (this.queryParams.query !== '') {
          this.queryParams.fullQuery = this.fullQueryExp;
        }
        this.$refs.fullQuery.focus();
      });
    },

    // Mark all subscribers in the query as selected.
    selectAllSubscribers() {
      this.bulk.all = true;
    },

    onTableCheck() {
      // Disable bulk.all selection if there are no rows checked in the table.
      if (this.bulk.checked.length !== this.subscribers.total) {
        this.bulk.all = false;
      }
    },

    // Show the edit list form.
    showEditForm(sub) {
      this.curItem = sub;
      this.isFormVisible = true;
      this.isEditing = true;
    },

    // Show the new list form.
    showNewForm() {
      this.curItem = {};
      this.isFormVisible = true;
      this.isEditing = false;
    },

    showBulkListForm() {
      this.isBulkListFormVisible = true;
    },

    sortSubscribers(field, order, event) {
      console.log(field, order, event);
    },

    // Search / query subscribers.
    querySubscribers() {
      this.$api.getSubscribers({
        list_ids: this.queryParams.listIDs,
        query: this.fullQueryExp,
      }).then(() => {
        this.bulk.checked = [];
      });
    },

    deleteSubscriber(sub) {
      this.$buefy.dialog.confirm({
        scroll: 'keep',
        message: 'Are you sure?',
        onConfirm: () => {
          this.$api.deleteSubscriber(sub.id).then(() => {
            this.querySubscribers();

            this.$buefy.toast.open({
              message: `'${sub.name}' deleted.`,
              type: 'is-success',
              queue: false,
            });
          });
        },
      });
    },

    blacklistSubscribers() {
      let fn = null;
      if (!this.bulk.all && this.bulk.checked.length > 0) {
        // If 'all' is not selected, blacklist subscribers by IDs.
        fn = () => {
          const ids = this.bulk.checked.map((s) => s.id);
          this.$api.blacklistSubscribers({ ids })
            .then(() => this.querySubscribers());
        };
      } else {
        // 'All' is selected, blacklist by query.
        fn = () => {
          this.$api.blacklistSubscribersByQuery({
            query: this.fullQueryExp,
            list_ids: [],
          }).then(() => this.querySubscribers());
        };
      }

      this.$buefy.dialog.confirm({
        scroll: 'keep',
        message: `Blacklist ${this.numSelectedSubscribers} subscriber(s)?`,
        onConfirm: fn,
      });
    },

    deleteSubscribers() {
      let fn = null;
      if (!this.bulk.all && this.bulk.checked.length > 0) {
        // If 'all' is not selected, delete subscribers by IDs.
        fn = () => {
          const ids = this.bulk.checked.map((s) => s.id);
          this.$api.deleteSubscribers({ id: ids })
            .then(() => {
              this.querySubscribers();

              this.$buefy.toast.open({
                message: `${this.numSelectedSubscribers} subscriber(s) deleted`,
                type: 'is-success',
                queue: false,
              });
            });
        };
      } else {
        // 'All' is selected, delete by query.
        fn = () => {
          this.$api.deleteSubscribersByQuery({
            query: this.fullQueryExp,
            list_ids: [],
          }).then(() => {
            this.querySubscribers();

            this.$buefy.toast.open({
              message: `${this.numSelectedSubscribers} subscriber(s) deleted`,
              type: 'is-success',
              queue: false,
            });
          });
        };
      }

      this.$buefy.dialog.confirm({
        scroll: 'keep',
        message: `Delete ${this.numSelectedSubscribers} subscriber(s)?`,
        onConfirm: fn,
      });
    },

    bulkChangeLists(action, lists) {
      const data = {
        action,
        target_list_ids: lists.map((l) => l.id),
      };

      let fn = null;
      if (!this.bulk.all && this.bulk.checked.length > 0) {
        // If 'all' is not selected, perform by IDs.
        fn = this.$api.addSubscribersToLists;
        data.ids = this.bulk.checked.map((s) => s.id);
      } else {
        // 'All' is selected, perform by query.
        fn = this.$api.addSubscribersToListsByQuery;
      }

      fn(data).then(() => {
        this.querySubscribers();
        this.$buefy.toast.open({
          message: 'List change applied',
          type: 'is-success',
          queue: false,
        });
      });
    },
  },

  computed: {
    ...mapState(['subscribers', 'loading', 'test']),

    // Turns the value into the simple input field into an SQL query expression.
    fullQueryExp() {
      const q = this.queryParams.query.replace(/'/g, "''").trim();
      if (!q) {
        return '';
      }
      return `(name ~* '${q}' OR email ~* '${q}')`;
    },

    numSelectedSubscribers() {
      if (this.bulk.all) {
        return this.subscribers.total;
      }
      return this.bulk.checked.length;
    },
  },

  mounted() {
    // Get subscribers on load.
    this.querySubscribers();
  },
});
</script>
