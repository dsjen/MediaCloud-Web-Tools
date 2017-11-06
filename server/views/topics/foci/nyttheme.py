import logging
from flask import jsonify, request
import flask_login

from server import app
from server.cache import cache
from server.util.request import api_error_handler, json_error_response, form_fields_required
from server.views.topics.apicache import topic_story_count
from server.auth import user_mediacloud_key, user_mediacloud_client
from server.util.tags import cached_tags_in_tag_set, media_with_tag, TAG_SET_GEOCODER_VERSION
from server.views.topics.apicache import topic_tag_coverage, topic_tag_counts
from server.views.topics.foci import FOCAL_TECHNIQUE_BOOLEAN_QUERY
from server.util.tags import NYT_LABELS_TAG_SET_ID
import server.util.tags as tag_util

logger = logging.getLogger(__name__)


@app.route('/api/topics/<topics_id>/focal-sets/nyt-theme/preview/story-counts', methods=['GET'])
@flask_login.login_required
@api_error_handler
def nyt_theme_story_counts(topics_id):
    user_mc = user_mediacloud_client()
    tag_story_counts = []
    tag_counts = topic_tag_counts(user_mc, topics_id, tag_util.NYT_LABELS_TAG_SET_ID,
                                  tag_util.GEO_SAMPLE_SIZE)

    return jsonify({'story_counts': tag_story_counts})


@app.route('/api/topics/<topics_id>/focal-sets/nyt-theme/preview/coverage', methods=['GET'])
@flask_login.login_required
@api_error_handler
def nyt_theme_coverage(topics_id):
    # TODO: add in overall timespan id here so it works in different snapshots
    # grab the total stories
    total_stories = topic_story_count(user_mediacloud_key(), topics_id)['count']

    query_country_tags = " ".join(map(str, tag_list))
    coverage = topic_tag_coverage(topics_id, query_country_tags)   # gets count and total

    if coverage is None:
       return jsonify({'status': 'Error', 'message': 'Invalid attempt'})
    return jsonify(coverage)



@app.route('/api/topics/<topics_id>/focal-sets/nyt-theme/create', methods=['POST'])
@form_fields_required('focalSetName', 'focalSetDescription')
@flask_login.login_required
def create_nyt_theme_focal_set(topics_id):
    user_mc = user_mediacloud_client()
    # grab the focalSetName and focalSetDescription and then make one
    focal_set_name = request.form['focalSetName']
    focal_set_description = request.form['focalSetDescription']
    focal_technique = FOCAL_TECHNIQUE_BOOLEAN_QUERY
    new_focal_set = user_mc.topicFocalSetDefinitionCreate(topics_id, focal_set_name, focal_set_description, focal_technique)
    if 'focal_set_definitions_id' not in new_focal_set:
        return json_error_response('Unable to create the subtopic set')
    # now make the foci in it - one for each partisanship quintile

    return {'success': True}
