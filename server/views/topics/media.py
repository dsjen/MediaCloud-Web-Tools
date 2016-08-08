import logging
import json
from flask import jsonify, request
import flask_login

from server import app, mc
from server.views.topics import validated_sort
import server.views.util.csv as csv

logger = logging.getLogger(__name__)

@app.route('/api/topics/<topics_id>/media/<media_id>', methods=['GET'])
#@flask_login.login_required
def media(topics_id, media_id):
    media_info = mc.media(media_id) # TODO: replace with topic media call
    return jsonify(media_info)

@app.route('/api/topics/<topics_id>/media', methods=['GET'])
#@flask_login.login_required
def topic_media(topics_id):
    sort = validated_sort(request.args.get('sort'))
    snapshots_id = request.args.get('snapshotId')
    timespans_id = request.args.get('timespanId')
    limit = request.args.get('limit')
    link_id = request.args.get('linkId')
    media_list = mc.topicMediaList(topics_id, snapshots_id=snapshots_id, timespans_id=timespans_id, sort=sort,
        limit=limit, link_id=link_id)
    return jsonify(media_list)

@app.route('/api/topics/<topics_id>/media.csv', methods=['GET'])
#@flask_login.login_required
def topic_media_csv(topics_id):
    sort = validated_sort(request.args.get('sort'))
    snapshots_id = request.args.get('snapshotId')
    timespans_id = request.args.get('timespanId')
    all_media = []
    link_id = None
    more_media = True
    try:
        while more_media:
            page = mc.topicMediaList(topics_id, snapshots_id=snapshots_id, timespans_id=timespans_id, sort=sort,
                limit=1000, link_id=link_id)
            all_media = all_media + page['media']
            if 'next' in page['link_ids']:
                link_id = page['link_ids']['next']
                more_media = True
            else:
                more_media = False
        logger.warn(len(all_media))
        props = ['media_id', 'name', 'url', 'story_count', 
                 'media_inlink_count', 'sum_media_inlink_count', 'inlink_count',
                 'outlink_count', 'bitly_click_count']
        return csv.stream_response(all_media, props, 'media')
    except Exception as exception:
        return json.dumps({'error':str(exception)}, separators=(',', ':')), 400
