<template>
  <section class="campaigns">
    <header class="columns">
      <div class="column is-two-thirds">
        <h1 class="title is-4">Campaigns</h1>
      </div>
      <div class="column has-text-right">
        <b-button type="is-primary" icon-left="plus">New</b-button>
      </div>
    </header>

    <b-table :data="campaigns.results" :hoverable="true" :loading="loading.campaigns"
      default-sort="createdAt">
        <template slot-scope="props">
            <b-table-column field="name" label="Name" sortable width="25%">
              <div>
                <p>
                  <router-link :to="{ name: 'campaign', params: { 'id': props.row.id }}">
                    {{ props.row.name }}</router-link>
                </p>
                <p class="is-size-7 has-text-grey">{{ props.row.subject }}</p>
                <b-taglist>
                    <b-tag v-for="t in props.row.tags" :key="t">{{ t }}</b-tag>
                </b-taglist>
              </div>
            </b-table-column>
            <b-table-column field="status" label="Status" width="12%">
              <div>
                <p><b-tag :class="props.row.status">{{ props.row.status }}</b-tag></p>
                <p v-if="isSheduled(props.row)">
                  <b-tooltip label="Scheduled" type="is-dark">
                    <span class="is-size-7 has-text-grey scheduled">
                      <b-icon icon="alarm" size="is-small" />
                      {{ $utils.niceDate(props.row.sendAt, true) }}
                    </span>
                  </b-tooltip>
                </p>
              </div>
            </b-table-column>
            <b-table-column class="lists" field="lists" label="Lists" width="18%">
              <ul class="no">
                <li v-for="l in props.row.lists" :key="l.id">
                  <router-link :to="`/subscribers/lists/${props.row.id}`">
                    {{ l.name }}
                  </router-link>
                </li>
              </ul>
            </b-table-column>
            <b-table-column field="createdAt" label="Timestamps" width="15%" sortable>
              <div class="fields timestamps">
                <p>
                  <label>Created</label>
                  {{ $utils.niceDate(props.row.createdAt, true) }}
                </p>
                <p v-if="props.row.startedAt">
                  <label>Started</label>
                  {{ $utils.niceDate(props.row.startedAt, true) }}
                </p>
                <p v-if="isDone(props.row)">
                  <label>Ended</label>
                  {{ $utils.niceDate(props.row.updatedAt, true) }}
                </p>
                <p v-if="props.row.startedAt && props.row.updatedAt" class="is-capitalized">
                  <label><b-icon icon="alarm" size="is-small" /></label>
                  {{ duration(props.row.startedAt, props.row.updatedAt) }}
                </p>
              </div>
            </b-table-column>

            <b-table-column :class="props.row.status" field="stats" label="Stats" width="17%">
              <div class="fields stats">
                <p>
                  <label>Sent</label>
                  {{ props.row.sent }} / {{ props.row.toSend }}
                </p>
                <p>
                  <label>Views</label>
                  {{ props.row.views }}
                </p>
                <p>
                  <label>Clicks</label>
                  {{ props.row.clicks }}
                </p>
              </div>
            </b-table-column>

            <b-table-column class="actions" width="13%">
              <a href="" v-if="canStart(props.row)"
                @click.prevent="confirm(() => startCampaign(props.row), 'Start campaign?')">
                <b-tooltip label="Start" type="is-dark">
                  <b-icon icon="rocket-launch-outline" size="is-small" />
                </b-tooltip>
              </a>
              <a href="" v-if="canPause(props.row)"
                @click.prevent="confirm">
                <b-tooltip label="Pause" type="is-dark">
                  <b-icon icon="pause-circle-outline" size="is-small" />
                </b-tooltip>
              </a>
              <a href="" v-if="canResume(props.row)"
                @click.prevent="confirm">
                <b-tooltip label="Send" type="is-dark">
                  <b-icon icon="clock-start" size="is-small" />
                </b-tooltip>
              </a>
              <a href="" v-if="canSchedule(props.row)"
                @click.prevent="confirm(() => scheduleCampaign,
                  `This campaign will start automatically at the
                    scheduled date and time. Schedule now?`)">
                <b-tooltip label="Schedule" type="is-dark">
                  <b-icon icon="clock-start" size="is-small" />
                </b-tooltip>
              </a>
              <a href="" @click.prevent="previewCampaign(props.row)">
                <b-tooltip label="Preview" type="is-dark">
                  <b-icon icon="file-find-outline" size="is-small" />
                </b-tooltip>
              </a>
              <a href="" @click.prevent="cloneCampaign(props.row)">
                <b-tooltip label="Clone" type="is-dark">
                  <b-icon icon="file-multiple-outline" size="is-small" />
                </b-tooltip>
              </a>
              <a href="" v-if="canCancel(props.row)"
                @click.prevent="confirm">
                <b-tooltip label="Cancel" type="is-dark">
                  <b-icon icon="trash-can-outline" size="is-small" />
                </b-tooltip>
              </a>
              <a href="" v-if="canDelete(props.row)"
                @click.prevent="confirm(() => deleteCampaign(props.row),
                  `Delete '${props.row.name}'?`)">
                <b-tooltip label="Delete" type="is-dark">
                  <b-icon icon="trash-can-outline" size="is-small" />
                </b-tooltip>
              </a>
            </b-table-column>
        </template>
        <template slot="empty" v-if="!loading.lists">
            <section class="section">
                <div class="content has-text-grey has-text-centered">
                    <p>
                        <b-icon icon="plus" size="is-large" />
                    </p>
                    <p>Nothing here.</p>
                </div>
            </section>
        </template>
    </b-table>

    <campaign-preview v-if="this.previewItem"
      type='campaign' :data="this.previewItem" @close="closePreview"></campaign-preview>
  </section>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import CampaignPreview from '../components/CampaignPreview.vue';

Vue.component('campaign-preview', CampaignPreview);

dayjs.extend(relativeTime);

export default Vue.extend({
  data() {
    return {
      previewItem: null,
    };
  },

  methods: {
    // Campaign statuses.
    canStart(c) {
      return c.status === 'draft' && !c.sendAt;
    },
    canSchedule(c) {
      return c.status === 'draft' && c.sendAt;
    },
    canPause(c) {
      return c.status === 'running';
    },
    canCancel(c) {
      return c.status === 'running' || c.status === 'paused';
    },
    canResume(c) {
      return c.status === 'paused';
    },
    canDelete(c) {
      return c.status === 'draft' || c.status === 'scheduled';
    },
    isSheduled(c) {
      return c.status === 'scheduled';
    },
    isDone(c) {
      return c.status === 'finished' || c.status === 'cancelled';
    },

    // Confirm shows a confirmation dialog and runs the given function on confirm.
    confirm(fn, msg) {
      this.$buefy.dialog.confirm({
        scroll: 'keep',
        message: !msg ? 'Are you sure?' : msg,
        onConfirm: fn,
      });
    },

    toast(msg) {
      this.$buefy.toast.open({
        message: msg,
        type: 'is-success',
        queue: false,
      });
    },

    duration(start, end) {
      return dayjs(end).from(dayjs(start), true);
    },

    // Campaign actions.
    previewCampaign(c) {
      this.previewItem = c;
    },

    closePreview() {
      this.previewItem = null;
    },

    startCampaign(c) {
      this.$api.startCampaign(c.id).then(() => {
        this.toast(`'${c.name}' started`);
        this.$api.getCampaigns();
      });
    },

    cloneCampaign(c) {
      this.$buefy.dialog.prompt({
        scroll: 'keep',
        message: 'Clone campaign',
        confirmText: 'Ok',
        inputAttrs: {
          type: 'string',
          placeholder: 'Campaign name',
          value: `Copy of ${c.name}`,
          maxlength: 200,
        },
        trapFocus: true,
        onConfirm: (name) => {
          const data = {
            name,
            subject: c.subject,
            lists: c.lists.map((l) => l.id),
            type: c.type,
            from_email: c.fromEmail,
            content_type: c.contentType,
            messenger: c.messenger,
            tags: c.tags,
            template_id: c.templateId,
            body: c.body,
          };
          this.$api.createCampaign(data).then(() => {
            this.$api.getCampaigns();
          });
        },
      });
    },

    deleteCampaign(c) {
      this.$api.deleteCampaign(c.id).then(() => {
        this.$api.getCampaigns();
        this.toast(`'${c.name}' deleted`);
      });
    },
  },

  computed: {
    ...mapState(['campaigns', 'loading']),
  },

  mounted() {
    this.$api.getCampaigns();
  },
});
</script>
