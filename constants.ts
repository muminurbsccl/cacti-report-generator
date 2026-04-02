import { CactiNodeMapping } from './types';

// The mapping table provided by the user
// Tags are short unique substrings found in graph titles via OCR.
// Multiple tags per mapping handle OCR variations (e.g. K misread as G).
export const NODE_MAPPINGS: CactiNodeMapping[] = [
  {
    id: '1',
    tags: ['ADN-DhakaColo', 'ADN-Dhaka', 'ADN-PRI'],
    clientName: 'ADN Telecom Limited',
    description: 'DHK-Primary',
    bandwidth: '4443.00 Mbps'
  },
  {
    id: '1-sec',
    tags: ['ADN-TEJ'],
    clientName: 'ADN Telecom Limited',
    description: 'DHK-Secondary',
    bandwidth: '0.00 Mbps'
  },
  {
    id: '2',
    tags: ['TELETALK-MOG', 'TELETALG-MOG', 'TELETALK-MOG', 'ELETALG-MOG', 'ELETALK-MOG'],
    clientName: 'Teletalk Bangladesh Limited',
    description: 'Dhaka PoP',
    bandwidth: '10000.00 Mbps'
  },
  {
    id: '2-ctg-pri',
    tags: ['TELETALK-CTG-PRI', 'TELETALG-CTG-PRI', 'TALK-CTG-PRI'],
    clientName: 'Teletalk Bangladesh Limited',
    description: 'Chittagong PoP',
    bandwidth: '2000.00 Mbps'
  },
  {
    id: '2-ctg-sec',
    tags: ['talk-CTG-Sec', 'TELETALK-CTG-SEC', 'TELETALG-CTG-SEC', 'Teltatalk-CTG-Sec', 'Teletalk-CTG-Sec'],
    clientName: 'Teletalk Bangladesh Limited',
    description: 'CTG-Secondary',
    bandwidth: '0.00 Mbps'
  },
  {
    id: '3',
    tags: ['COL-CTG-Pri', 'COL-CTG-BE'],
    clientName: 'Chittagong Online Ltd.',
    description: 'CTG-Primary',
    bandwidth: '1500.00 Mbps'
  },
  {
    id: '3-sec',
    tags: ['COL-CTG-Sec'],
    clientName: 'Chittagong Online Ltd.',
    description: 'Limited Destination Bonus Bandwidth',
    bandwidth: '0.00 Mbps'
  },
  {
    id: '4',
    tags: ['PIONIER', 'PIONEER'],
    clientName: 'Pioneer Services Ltd.',
    description: 'DHK',
    bandwidth: '6.00 Mbps'
  },
  {
    id: '5',
    tags: ['COXLINKT'],
    clientName: 'Cox Link IT',
    description: 'COX',
    bandwidth: '219.00 Mbps'
  },
  {
    id: '6',
    tags: ['SSOnline-DC', 'SSONLINE-DC', 'SSOnline-PRI', 'SSONLINE-PRI'],
    clientName: 'SSONLINE',
    description: 'DHK-Primary',
    bandwidth: '1000.00 Mbps'
  },
  {
    id: '6-sec',
    tags: ['SSONLINE-SEC', 'SSOnline-SEC'],
    clientName: 'SSONLINE',
    description: 'DHK-Secondary',
    bandwidth: '0.00 Mbps'
  },
  {
    id: '7',
    tags: ['BDREN-PRI', 'BDREN-PRL'],
    clientName: 'University Grants Commission of Bangladesh',
    description: 'Primary',
    bandwidth: '9000.00 Mbps'
  },
  {
    id: '7-sec',
    tags: ['BDREN-SEC'],
    clientName: 'University Grants Commission of Bangladesh',
    description: 'Secondary',
    bandwidth: '0.00 Mbps'
  },
  {
    id: '8',
    tags: ['BDCCL-MOG', 'BDCCL-PRI'],
    clientName: 'Bangladesh Data Center Company Limited (BDCCL)',
    description: 'DHK',
    bandwidth: '11136.00 Mbps'
  },
  {
    id: '9',
    tags: ['LINK3-DhakaColo', 'LINK3-Dhaka', 'LINK3-PRI'],
    clientName: 'Link-3 Technologies Limited',
    description: 'DHK-Primary',
    bandwidth: '1666.00 Mbps'
  },
  {
    id: '9-sec',
    tags: ['Link3-TEJ', 'LINK3-TEJ', 'LINK3-SEC'],
    clientName: 'Link-3 Technologies Limited',
    description: 'DHK-Secondary',
    bandwidth: '0.00 Mbps'
  },
  {
    id: '10',
    tags: ['DhakaLink-PRI', 'DhakalLink-PRI', 'DHKLINK-PRI'],
    clientName: 'Dhaka Link Communications',
    description: 'DHK-Primary',
    bandwidth: '56.00 Mbps'
  },
  {
    id: '10-sec',
    tags: ['DhakaLink-SEC', 'DhakalLink-SEC', 'DHKLINK-SEC'],
    clientName: 'Dhaka Link Communications',
    description: 'DHK-Secondary',
    bandwidth: '0.00 Mbps'
  },
  {
    id: '11',
    tags: ['BDREN-L2-VPN', 'BDREN-L2'],
    clientName: 'University Grants Commission of Bangladesh',
    description: 'VPN/Equinix',
    bandwidth: '1000.00 Mbps'
  },
  {
    id: '12',
    tags: ['RACEOnline', 'RACE ONLINE', 'RACEONLINE', 'RACE-Online'],
    clientName: 'Race Online',
    description: 'Dhk-Colo',
    bandwidth: '1500.00 Mbps'
  },
  {
    id: '13',
    tags: ['Telnet-DC', 'TELNET-DC'],
    clientName: 'Telnet',
    description: 'Dhk-Colo',
    bandwidth: '200.00 Mbps'
  }
];
