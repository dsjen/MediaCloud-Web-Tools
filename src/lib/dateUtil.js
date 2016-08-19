import moment from 'moment';

const SOLR_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';

const GAP_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ssZ';

function solrDateToMoment(solrDateString, string = true) {
  return moment(solrDateString, SOLR_DATE_FORMAT, string);
}

function gapDateToMomemt(gapDateString, strict = true) {
  return moment(gapDateString, GAP_DATE_FORMAT, strict);
}

// Helper to change solr dates (2015-12-14T00:00:00Z) into javascript date ojects
export function cleanDateCounts(countsMap) {
  const countsArray = [];
  Object.keys(countsMap).forEach((k) => {
    if (k !== 'end' && k !== 'gap' && k !== 'start') {
      const v = countsMap[k];
      const timestamp = solrDateToMoment(k).unix();
      countsArray.push({ date: timestamp, count: v });
    }
  });
  return countsArray.sort((a, b) => a.date - b.date);
}

// Turn a gap list into a list of objects with from/to/color attributes, suitable for use as plot bands in HighCharts
export function cleanCoverageGaps(gapList) {
  let plotBands = [];
  plotBands = gapList.map((gap) => {
    const weekStart = gapDateToMomemt(gap.stat_week).unix();
    const weekEnd = weekStart + 604800;    // + one week
    return {
      from: weekStart,
      to: weekEnd,
      color: 'rgba(255, 0, 0, .6)',
    };
  });
  return plotBands;
}
