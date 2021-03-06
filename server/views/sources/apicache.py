import datetime
import operator

import server.util.tags as tags
from server import mc
from server.auth import user_mediacloud_client, user_mediacloud_key
from server.cache import cache, key_generator
from server.util.api_helper import add_missing_dates_to_split_story_counts
from server.views.sources import FEATURED_COLLECTION_LIST
from server.views.stories import QUERY_LAST_MONTH


def tag_set_with_private_collections(mc_api_key, tag_sets_id):
    return tags.tag_set_with_tags(mc_api_key, tag_sets_id, False)


def tag_set_with_public_collections(mc_api_key, tag_sets_id):
    return tags.tag_set_with_tags(mc_api_key, tag_sets_id, True)


def tags_in_tag_set(mc_api_key, tag_sets_id, only_public_tags, use_file_cache=False):
    return tags.tag_set_with_tags(mc_api_key, tag_sets_id, only_public_tags, use_file_cache)


def featured_collections():
    return _cached_featured_collection_list()


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_featured_collection_list():
    return [mc.tag(tags_id) for tags_id in FEATURED_COLLECTION_LIST]


def collection_source_representation(mc_api_key, collection_id):
    return _cached_collection_source_representation(mc_api_key, collection_id)


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_collection_source_representation(mc_api_key, collection_id):
    # have to respect the api here here because only some folks can see private collections
    sample_size = 1000
    stories = random_story_list(mc_api_key, 'tags_id_media:' + str(collection_id), rows=sample_size)
    media_representation = {}
    for s in stories:
        if s['media_id'] not in media_representation:
            media_representation[s['media_id']] = {
                'media_id': s['media_id'],
                'media_name': s['media_name'],
                'media_url': s['media_url'],
                'sample_size': sample_size,
                'stories': 0
            }
        media_representation[s['media_id']]['stories'] += 1
    for media_id in media_representation:
        media_representation[media_id]['story_pct'] = float(media_representation[media_id]['stories']) / float(
            sample_size)
    return sorted(media_representation.values(), key=operator.itemgetter('stories'))


def random_story_list(mc_api_key, q, fq=None, rows=1000):
    return _cached_random_story_list(q, fq, rows)


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_random_story_list(q, fq, rows):
    # sources are open to everyone, so no need for user-specific cache
    return mc.storyList(q, fq, rows=rows, sort=mc.SORT_RANDOM)


def last_year_split_story_count(user_mc_key, q='*'):
    return _cached_last_year_split_story_count(q)


def timeperiod_story_count(user_mc, query, time_period):
    return _cached_timeperiod_story_count(query, time_period)


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_timeperiod_story_count(q='*', time_period=QUERY_LAST_MONTH):
    # sources are open to everyone, so no need for user-specific cache
    # Helper to fetch split story counts over a timeframe for an arbitrary query
    user_mc = user_mediacloud_client()
    results = user_mc.storyCount(solr_query=q, solr_filter=time_period)
    return results


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_last_year_split_story_count(q='*'):
    # sources are open to everyone, so no need for user-specific cache
    # Helper to fetch split story counts over a timeframe for an arbitrary query
    user_mc = user_mediacloud_client()
    last_n_days = 365
    start_date = datetime.date.today()-datetime.timedelta(last_n_days)
    end_date = datetime.date.today()-datetime.timedelta(1)  # yesterday
    fq = user_mc.publish_date_query(start_date, end_date)
    results = user_mc.storyCount(solr_query=q, solr_filter=fq, split=True, split_period='day')
    results['counts'] = add_missing_dates_to_split_story_counts(results['counts'], start_date, end_date)
    results['total_story_count'] = sum([r['count'] for r in results['counts']])
    return results


def source_story_count(user_mc_key, query):
    return cached_source_story_count(query)


@cache.cache_on_arguments(function_key_generator=key_generator)
def cached_source_story_count(query):
    # sources are open to everyone, so no need for user-specific cache
    user_mc = user_mediacloud_client()
    return user_mc.storyCount(query)['count']


def tag_coverage_pct(user_mc_key, query, tag_sets_id):
    # What pct of stories matching the query been tagged with any tag in the set specified?
    # cache can be user-agnostic here because source stats aren't permissioned
    return _cached_tag_coverage_pct(query, tag_sets_id)


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_tag_coverage_pct(query, tag_sets_id):
    user_mc = user_mediacloud_client()
    story_count = source_story_count(user_mediacloud_key(), query)
    tagged_story_counts = user_mc.storyTagCount(solr_query=query, tag_sets_id=tag_sets_id)
    # sum tagged articles because there are different versions
    tagged_sum = sum([tag_info['count'] for tag_info in tagged_story_counts])
    # compute coverage ratio (protect against div by zero)
    ratio = float(tagged_sum) / float(story_count) if story_count > 0 else 0
    return ratio
