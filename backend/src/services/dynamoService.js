import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  ScanCommand, 
  UpdateCommand 
} from '@aws-sdk/lib-dynamodb';

const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE_NAME = process.env.TABLE_NAME || 'StreetSignal-Reports';

// Create DynamoDB Client
const rawClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

// In-memory fallback cache for seamless offline / local development
let localReportsStore = null;

function getLocalStore() {
  if (!localReportsStore) {
    localReportsStore = [
      {
        reportId: 'SIG-842910',
        category: 'Potholes',
        locality: 'MG Road, Indiranagar',
        description: 'Large, hazardous crater-sized pothole right near the metro pillar #142 causing vehicle damage and traffic slowdown.',
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        status: 'In Progress',
        priority: 'High',
        reporterName: 'Arjun Verma',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        timeline: [
          { status: 'Submitted', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), note: 'Report logged by citizen' },
          { status: 'Under Review', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), note: 'Inspected by Municipal Roads Division' },
          { status: 'In Progress', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), note: 'Asphalt patching crew dispatched' }
        ]
      },
      {
        reportId: 'SIG-519302',
        category: 'Garbage',
        locality: 'Koramangala 4th Block',
        description: 'Overflowing commercial waste bins spreading onto the pedestrian walkway near the main market square.',
        imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
        status: 'Submitted',
        priority: 'Medium',
        reporterName: 'Priya Sundaram',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        timeline: [
          { status: 'Submitted', timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), note: 'Report logged by citizen' }
        ]
      },
      {
        reportId: 'SIG-391084',
        category: 'Streetlights',
        locality: 'HSR Layout Sector 2',
        description: 'Row of three streetlights completely non-operational on 14th Main for past 4 nights. Dark stretch poses safety risk.',
        imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        status: 'Resolved',
        priority: 'High',
        reporterName: 'Rohan Mehta',
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        timeline: [
          { status: 'Submitted', timestamp: new Date(Date.now() - 3600000 * 72).toISOString(), note: 'Report logged by citizen' },
          { status: 'Under Review', timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), note: 'Assigned to Bescom electrical field wing' },
          { status: 'In Progress', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), note: 'LED luminaires and fuse assembly replaced' },
          { status: 'Resolved', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), note: 'Illumination restored and verified' }
        ]
      },
      {
        reportId: 'SIG-724198',
        category: 'Water Leakage',
        locality: 'Whitefield Main Road',
        description: 'Subterranean municipal pipeline rupture bubbling up fresh water onto the road surface near ITPL gate 3.',
        imageUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?auto=format&fit=crop&w=800&q=80',
        status: 'In Progress',
        priority: 'Critical',
        reporterName: 'Kavita Das',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        timeline: [
          { status: 'Submitted', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), note: 'Report logged by citizen' },
          { status: 'Under Review', timestamp: new Date(Date.now() - 3600000 * 9).toISOString(), note: 'Emergency water supply team notified' },
          { status: 'In Progress', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), note: 'Main valve isolated, excavation in progress' }
        ]
      },
      {
        reportId: 'SIG-638201',
        category: 'Road Dust',
        locality: 'Outer Ring Road, Bellandur',
        description: 'Heavy construction aggregate dust accumulation on curbside reducing visibility and causing respiratory distress.',
        imageUrl: null,
        status: 'Submitted',
        priority: 'Medium',
        reporterName: 'Deepak Rao',
        createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
        timeline: [
          { status: 'Submitted', timestamp: new Date(Date.now() - 3600000 * 28).toISOString(), note: 'Report logged by citizen' }
        ]
      }
    ];
  }
  return localReportsStore;
}

/**
 * Saves a new civic issue report to DynamoDB
 */
export async function saveReport(report) {
  const item = {
    ...report,
    createdAt: report.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: report.status || 'Submitted',
    timeline: report.timeline || [
      {
        status: report.status || 'Submitted',
        timestamp: new Date().toISOString(),
        note: 'Issue reported by citizen'
      }
    ]
  };

  // If local mock mode is forced or if AWS environment is missing
  if (process.env.USE_MOCK_DB === 'true') {
    getLocalStore().unshift(item);
    return item;
  }

  try {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    });
    await docClient.send(command);
    return item;
  } catch (error) {
    // If DynamoDB is unreachable locally, seamlessly fallback to local memory store
    if (process.env.NODE_ENV !== 'production' && (error.name === 'ResourceNotFoundException' || error.name === 'UnrecognizedClientException' || error.name === 'CredentialsProviderError' || error.code === 'ConfigError')) {
      console.warn(`[DynamoDB Fallback] AWS DynamoDB unavailable (${error.message}). Saving to local store.`);
      getLocalStore().unshift(item);
      return item;
    }
    throw error;
  }
}

/**
 * Retrieves a report by its unique reference ID
 */
export async function getReportById(reportId) {
  if (process.env.USE_MOCK_DB === 'true') {
    const found = getLocalStore().find(r => r.reportId.toUpperCase() === reportId.toUpperCase());
    return found || null;
  }

  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { reportId }
    });
    const response = await docClient.send(command);
    if (response.Item) return response.Item;

    // Also check local store if running in dev mode
    if (process.env.NODE_ENV !== 'production') {
      const local = getLocalStore().find(r => r.reportId.toUpperCase() === reportId.toUpperCase());
      if (local) return local;
    }
    return null;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[DynamoDB Fallback] Fetching from local store for ${reportId}`);
      return getLocalStore().find(r => r.reportId.toUpperCase() === reportId.toUpperCase()) || null;
    }
    throw error;
  }
}

/**
 * Lists reports with optional category, locality, and status filters
 */
export async function listReports({ category, locality, status, search, limit = 50 } = {}) {
  if (process.env.USE_MOCK_DB === 'true') {
    return filterReports(getLocalStore(), { category, locality, status, search, limit });
  }

  try {
    // Perform Scan with FilterExpression if filters provided
    const filterExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    if (category) {
      filterExpressions.push('#cat = :category');
      expressionAttributeNames['#cat'] = 'category';
      expressionAttributeValues[':category'] = category;
    }

    if (status) {
      filterExpressions.push('#stat = :status');
      expressionAttributeNames['#stat'] = 'status';
      expressionAttributeValues[':status'] = status;
    }

    if (locality) {
      filterExpressions.push('contains(#loc, :locality)');
      expressionAttributeNames['#loc'] = 'locality';
      expressionAttributeValues[':locality'] = locality;
    }

    const scanParams = {
      TableName: TABLE_NAME,
      Limit: limit
    };

    if (filterExpressions.length > 0) {
      scanParams.FilterExpression = filterExpressions.join(' AND ');
      scanParams.ExpressionAttributeNames = expressionAttributeNames;
      scanParams.ExpressionAttributeValues = expressionAttributeValues;
    }

    const command = new ScanCommand(scanParams);
    const result = await docClient.send(command);
    let items = result.Items || [];

    // In dev mode, merge with any local items
    if (process.env.NODE_ENV !== 'production' && items.length === 0) {
      items = filterReports(getLocalStore(), { category, locality, status, search, limit });
    }

    // Sort descending by createdAt
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Secondary in-memory search for keywords if requested
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(r => 
        r.reportId.toLowerCase().includes(q) ||
        r.locality.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }

    return items;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[DynamoDB Fallback] Listing from local store`);
      return filterReports(getLocalStore(), { category, locality, status, search, limit });
    }
    throw error;
  }
}

function filterReports(items, { category, locality, status, search, limit }) {
  let filtered = [...items];
  if (category) {
    filtered = filtered.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }
  if (status) {
    filtered = filtered.filter(i => i.status.toLowerCase() === status.toLowerCase());
  }
  if (locality) {
    filtered = filtered.filter(i => i.locality.toLowerCase().includes(locality.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(r => 
      r.reportId.toLowerCase().includes(q) ||
      r.locality.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  }
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return filtered.slice(0, limit);
}

/**
 * Updates a report's status and adds a timeline entry
 */
export async function updateReportStatus(reportId, newStatus, note = '') {
  const updatedAt = new Date().toISOString();
  const timelineEntry = {
    status: newStatus,
    timestamp: updatedAt,
    note: note || `Status updated to ${newStatus}`
  };

  if (process.env.USE_MOCK_DB === 'true') {
    const item = getLocalStore().find(r => r.reportId.toUpperCase() === reportId.toUpperCase());
    if (!item) return null;
    item.status = newStatus;
    item.updatedAt = updatedAt;
    item.timeline = item.timeline || [];
    item.timeline.push(timelineEntry);
    return item;
  }

  try {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { reportId },
      UpdateExpression: 'SET #st = :status, #up = :updatedAt, #tl = list_append(if_not_exists(#tl, :empty_list), :new_entry)',
      ExpressionAttributeNames: {
        '#st': 'status',
        '#up': 'updatedAt',
        '#tl': 'timeline'
      },
      ExpressionAttributeValues: {
        ':status': newStatus,
        ':updatedAt': updatedAt,
        ':new_entry': [timelineEntry],
        ':empty_list': []
      },
      ReturnValues: 'ALL_NEW'
    });
    const result = await docClient.send(command);
    return result.Attributes;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      const item = getLocalStore().find(r => r.reportId.toUpperCase() === reportId.toUpperCase());
      if (item) {
        item.status = newStatus;
        item.updatedAt = updatedAt;
        item.timeline = item.timeline || [];
        item.timeline.push(timelineEntry);
        return item;
      }
    }
    throw error;
  }
}

/**
 * Aggregates summary analytics for reports
 */
export async function getAnalyticsSummary() {
  const allReports = await listReports({ limit: 500 });

  const totalReports = allReports.length;
  const statusCounts = {
    Submitted: 0,
    'Under Review': 0,
    'In Progress': 0,
    Resolved: 0
  };

  const categoryCounts = {
    Potholes: 0,
    Garbage: 0,
    'Road Dust': 0,
    'Water Leakage': 0,
    Streetlights: 0
  };

  const localityCounts = {};

  allReports.forEach(r => {
    // Status
    if (statusCounts[r.status] !== undefined) {
      statusCounts[r.status]++;
    } else {
      statusCounts[r.status] = 1;
    }

    // Category
    if (categoryCounts[r.category] !== undefined) {
      categoryCounts[r.category]++;
    } else {
      categoryCounts[r.category] = 1;
    }

    // Locality
    const loc = r.locality || 'Unknown';
    localityCounts[loc] = (localityCounts[loc] || 0) + 1;
  });

  // Top localities formatted
  const topLocalities = Object.entries(localityCounts)
    .map(([locality, count]) => ({ locality, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Category distribution formatted for charts
  const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
    percentage: totalReports > 0 ? Math.round((count / totalReports) * 100) : 0
  }));

  // Status distribution
  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: totalReports > 0 ? Math.round((count / totalReports) * 100) : 0
  }));

  // Resolution Rate
  const resolvedCount = statusCounts.Resolved || 0;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;

  // Recent submissions (latest 5)
  const recentSubmissions = allReports.slice(0, 6);

  return {
    totalReports,
    resolutionRate,
    statusCounts,
    categoryCounts,
    categoryDistribution,
    statusDistribution,
    topLocalities,
    recentSubmissions,
    generatedAt: new Date().toISOString()
  };
}
