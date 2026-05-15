// Mapping of field names to their definitions based on definitions.txt
export const fieldDefinitions: Record<string, string | Record<string, string>> = {
  // Basic Information Fields
  "DUNS Number": "Dun & Bradstreet (D&B) developed the D-U-N-S number, a unique nine-digit identifier for businesses, to enhance its professional credit reporting practices. Globally recognized, this number establishes a business's credit file, identifies corporate relationships, and verifies a company's identity for purposes like funding and global trade.",
  "Data Center Operator": "It is an organization or company that professionally oversees the daily management, maintenance, and service delivery within a data center.",
  "Data Center Facility Name": "A data center facility name is the specific label professionally assigned to a physical data center location, distinguishing it from others in a company's portfolio or the broader industry.",
  "Official Facility Name": "The official data center facility name is the formally designated title professionally given to a data center by its owner or operator. Used for legal, operational, and commercial purposes, this name uniquely identifies the facility within a company's portfolio or the industry.",
  "Provisional Facility Name": "A provisional data center facility name is a temporary label professionally based on the data center operator's name and location. It's subject to change if the operator modifies the name on their official website.",
  "Data Center Operator E-mail ID": "The Data Center Operator E-mail ID is the official email address of the organization or team responsible for professionally managing a data center, serving as the primary point of contact for facility-related inquiries.",
  "Data Center Operator Website": "The Data Center Operator Website is the official online portal of the company or organization that professionally owns or manages a data center, acting as a hub for information and customer engagement.",
  "DC Operator Facility Address": "The DC Operator Facility Address is the official street address of a data center professionally operated by a specific company or organization.",
  "Latitude and Longitude": "The latitude and longitude of a data center facility are its exact geographic coordinates, which are professionally essential for mapping, logistics, and operational purposes.",
  
  // Data Center Status
  "Data Center Status": {
    "Commissioned": "A Commissioned Data Center Status indicates the data center has completed construction, passed inspections, and is professionally fully operational, ready to host IT infrastructure.",
    "Under Construction": "An 'Under Construction' status indicates that the facility is in the building phase and is not yet operational, having progressed through planning and design but not yet reached commissioning.",
    "Announced": "An 'Announced' status means the project has been publicly disclosed but construction hasn't started, marking the earliest formal stage in a data center's lifecycle.",
    "Canceled": "A 'Canceled' data center status signifies the official termination of a planned project, professionally preventing any construction or operation. This typically applies to projects that are announced or in early development but are later abandoned.",
  },
  
  // Commission and Capacity
  "Year of Commission": "The Year of Commission refers to the calendar year in which a data center officially became operational, having completed its professional construction and necessary testing.",
  "Current IT Load Capacity": "IT load capacity, often referred to as installed capacity, professionally denotes the energy consumption of servers and network equipment housed within a rack. This capacity is quantified in megawatts (MW).",
  "Expected IT Load Capacity (MW)": "IT load capacity, often referred to as installed capacity, professionally denotes the energy consumption of servers and network equipment housed within a rack. This capacity is quantified in megawatts (MW).",
  "IT Load Capacity": "IT load capacity, often referred to as installed capacity, professionally denotes the energy consumption of servers and network equipment housed within a rack. This capacity is quantified in megawatts (MW).",
  
  // Data Center Type
  "Data Center Type": {
    "Colocation": "A colocation data center enables businesses to rent space for their servers and IT infrastructure, providing a shared, professionally managed environment rather than building their own.",
    "Cloud Service Providers": "Companies such as AWS, Google Cloud, and Microsoft Azure are cloud service providers, offering on-demand computing resources and services over the internet professionally.",
    "Enterprise": "An enterprise data center is a privately owned facility used by a single organization, such as a large business or government agency, to host its IT infrastructure. This differs from colocation or cloud data centers, which serve multiple clients.",
    "Edge": "An edge data center is a small, decentralized facility strategically located near end users.",
  },
  
  // Data Center Size
  "Data Center Size": {
    "Small": "A small data center is defined as a data center with a floor space of ≤ 5,000 sq. ft. or ≤ 200 racks.",
    "Medium": "A medium data center spans 5,001 to 20,000 sq. ft or professionally accommodates 201 to 800 racks.",
    "Large": "A large data center ranges from 20,001 to 75,000 sq. ft or professionally hosts 801 to 3,000 racks.",
    "Hyperscale": "A hyperscale data center exceeds 75,001 sq. ft or professionally accommodates over 3,001 racks.",
  },
  
  // Tier Levels
  "Tier Certification": {
    "Tier 1": "A Tier 1 data center, with non-redundant power and cooling components, professionally boasts an uptime of 99.67%, translating to an annual downtime of <28.8 hours.",
    "Tier 2": "A Tier 2 data center features redundant power and cooling components, professionally achieving an uptime of 99.74% and an annual downtime of <22 hours.",
    "Tier 3": "A Tier 3 data center, resistant to both planned and unplanned disruptions, professionally boasts an uptime of 99.98% and an annual downtime of <1.6 hours.",
    "Tier 4": "The most resilient, a Tier 4 data center ensures uninterrupted operation with its dual-powered IT equipment, professionally achieving an uptime of 99.99% and an annual downtime of <26.3 minutes.",
  },
  
  // Efficiency and Investment
  "PUE Rating": "PUE, a metric for data center efficiency, is calculated professionally as follows (Total Data Center Energy Consumption) / (Total IT Equipment Energy Consumption). A PUE of 1.2-1.5 indicates high efficiency, while a PUE >2 signals inefficiency.",
  "Project Investment Value (USD)": "The total estimated or actual financial cost required to professionally plan, build, equip, and launch a data center is termed as the project investment value. This value signifies the capital expenditure (CapEx) essential for transitioning the data center from a mere concept to an operational entity.",
  
  // Rack Information
  "Number of Racks": "The total count of racks available in the data center for housing IT equipment.",
  "Rack Density": "Rack density is a professional measurement of the power consumption of equipment and servers within a rack, expressed in kilowatts (kW). This metric is pivotal in data center design, as it influences both cooling and power planning.",
  "DC Rack Density (kW)": "Rack density is a professional measurement of the power consumption of equipment and servers within a rack, expressed in kilowatts (kW). This metric is pivotal in data center design, as it influences both cooling and power planning.",
  
  // Power Backup Types
  "Power Backup Type": {
    "Generator": "Generators are integral to data centers, providing a professionally guaranteed, uninterrupted power supply and preventing downtime. Typically, data centers are equipped with diesel generators, and they maintain a 48-hour diesel reserve to counter any potential disruptions.",
    "Diesel Generator": "A diesel generator serves as a backup power system for data centers, professionally utilizing diesel fuel to produce electricity during primary power failures. This ensures the data center's operational continuity during outages, safeguarding critical infrastructure and ensuring uptime.",
    "UPS": "A UPS, or Uninterruptible Power Supply, is a device that interfaces with a utility power supply. It professionally stores energy in batteries, ensuring a continuous power supply to IT equipment, even during power outages from the utility.",
    "Battery Backup": "In a data center, battery backup provides immediate, short-term power to essential IT infrastructure during outages, ensuring operations continue seamlessly until longer-term systems, such as diesel generators, can take over.",
    "Gas Generator": "A Gas Generator in a data center harnesses natural gas or other gaseous fuels, such as biogas or propane, to produce electricity during power outages. While it serves the same purpose as a diesel generator, its professionally cleaner emissions and fuel flexibility make it a preferred choice for environmentally conscious or urban data centers.",
    "100% Renewable Power Backup": "A data center boasting a 100% Renewable Power Backup ensures that its emergency power systems, activated during grid outages, derive their energy solely from renewable sources, eschewing fossil fuels such as diesel or natural gas.",
    "DRUPS": "The Diesel Rotary Uninterruptible Power Supply (DRUPS) is a hybrid power backup solution for data centers. It professionally merges a flywheel-based UPS with a diesel generator into a cohesive unit, delivering immediate power protection and extended backup during electrical outages.",
    "Static UPS": "A Static UPS (Uninterruptible Power Supply System) in a data center is a battery-based system that offers immediate backup power and voltage regulation during grid disruptions.",
    "Modular UPS": "A modular UPS in a data center consists of individual power modules that can be added or removed based on the facility's evolving power requirements.",
    "Rotary UPS": "A rotary UPS in a data center utilizes a flywheel for storing kinetic energy, delivering instant backup power during grid failures.",
  },
  
  // Redundancy Levels
  // "Redundancy Levels Power": {
  //   "N": "The configuration refers to the tools and equipment required for a data center to operate at full capacity, with no backup available in case of failure.",
  //   "N+1": "The configuration refers to an additional unit to prevent downtime during failures. For example, a data center with four UPS systems requires an additional UPS to achieve N+1 redundancy.",
  //   "2N": "The configuration refers to a fully redundant design with two independent power distribution systems, ensuring uninterrupted operation in the event of a system failure.",
  //   "N+2": "The configuration refers to two extra backup components beyond the minimum required (N), ensuring operation even with two simultaneous failures.",
  //   "2N+1": "The configuration refers to the two independent systems (2N) with one additional backup (+1), ensuring maximum fault tolerance.",
  //   "N+N": "The configuration refers to the two identical systems, each capable of supporting the full operational load (N), ensuring performance even if one system fails.",
  //   "N+3": "The configuration refers to the three additional backup components beyond the minimum required (N), ensuring functionality even with three simultaneous failures.",
  //   "3N+1": "A configuration with three times the required capacity (3N) and one extra backup (+1), used in specialized environments.",
  //   "2x(N+1)": "The configuration refers to the two independent systems, each supporting the full load (N) with an extra unit (+1) for backup, ensuring dual-path fault tolerance.",
  //   "2N+2N": "The configuration refers to the two fully redundant systems, each duplicated, resulting in four systems capable of supporting the full operational load.",
  //   "2N+2": "The configuration refers to two independent systems (2N) with two additional backup units, ensuring high fault tolerance in critical environments.",
  //   "2N+X": "The configuration refers to the two independent systems (2N) and a variable number of backup units (X), tailored for environments requiring more than standard 2N redundancy.",
  //   "N+20%": "The configuration provides 20% more capacity than the minimum required (N), offering a buffer against demand spikes without full duplication.",
  //   "2N+C": "The configuration includes two independent systems (2N) and additional capacity (C) for load balancing or future growth, often used in hyperscale data centers.",
  //   "5+N": "The configuration includes five units, meeting the minimum required capacity (N), catering to environments that require extra fault tolerance or scalability.",
  //   "N+4": "The configuration provides four extra units beyond the minimum (N), ensuring operation even with four simultaneous failures.",
  //   "N+20% CRAH": "The configuration provides 20% more CRAH capacity than the minimum (N), offering a buffer against thermal spikes without full duplication.",
  //   "N+5": "The configuration refers to the addition of five additional units beyond the minimum (N), ensuring operation even with five simultaneous failures.",
  //   "N+6": "The configuration refers to the addition of six extra units beyond the minimum (N), ensuring operation even with six simultaneous failures.",
  //   "N+7": "The configuration refers to the addition of seven additional units beyond the minimum (N), ensuring operation even with seven simultaneous failures.",
  //   "3N": "The configuration provides three times the required capacity (3×N), catering to environments demanding extreme fault tolerance.",
  //   "N+2C": "The configuration combines the minimum capacity (N) with two extra cooling units (2C) for redundancy, ensuring high availability.",
  //   "N+25%": "The configuration provides 25% more capacity than the minimum (N), offering moderate fault tolerance without full duplication.",
  //   "N2+20%": "The configuration refers to double the minimum capacity (N2) with an extra 20% buffer for fault tolerance.",
  //   "N+2 CRAHS": "The configuration adds two extra CRAH units beyond the minimum (N), enhancing fault tolerance for critical environments.",
  //   "4N": "The configuration provides four times the required capacity (4×N), a rare configuration for environments demanding zero downtime.",
  //   "N+15%": "The configuration provides 15% more capacity than the minimum (N), offering moderate fault tolerance without full duplication.",
  //   "N=25%": "The configuration refers to redundant capacity equaling 25% of the operational load (N), a partial redundancy model.",
  // },
  "Redundancy Levels Power": "It is a professional configuration that defines the level of backup and fault tolerance in a data center's power systems, ensuring continuous operation during component failures or maintenance.",
  
  "Redundancy Levels Cooling": "Cooling redundancy in a data center ensures that temperature control remains consistent, even if some cooling units fail. This safeguard is professionally crucial for protecting sensitive IT equipment from overheating.",
  
  // Cybersecurity Certifications
  // "Cybersecurity Certification": {
  //   "ISO 27001": "ISO 27001 is the international standard for Information Security Management Systems (ISMS) in data centers, ensuring robust policies and controls to protect against breaches, unauthorized access, and cyber threats while meeting global security standards.",
  //   "ISO 9001": "ISO 9001 is the global standard for Quality Management Systems (QMS) in data centers, ensuring consistent service quality, customer satisfaction, process improvement, compliance, operational efficiency, and continuous improvement through effective documentation.",
  //   "SOC 2 Type II": "SOC 2 Type II report is an independent audit verifying a data center's security controls for design and operational effectiveness over 3 to 12 months, ensuring robust and consistent protection of customer data as per AICPA's Trust Services Criteria.",
  //   "PCI DSS": "PCI DSS certification validates that a data center meets strict security standards to securely store, process, or transmit credit card data, protecting against breaches and complying with mandates from the Payment Card Industry Security Standards Council.",
  //   "ISO 22301": "ISO 22301 provides a framework for Business Continuity Management Systems (BCMS), enabling data centers to ensure critical operations continue during and after disruptions.",
  //   "SSAE 16 Type 2": "SSAE-16, developed by the AICPA, outlined auditing standards for service organizations like data centers, focusing on controls relevant to clients' financial reporting.",
  //   "HIPAA": "HIPAA requires healthcare organizations to safeguard electronic protected health information (ePHI) through physical, technical, and administrative measures. A HIPAA-compliant data center ensures data security with strict access controls, security training, disaster recovery plans, and regular audits.",
  // },
  "Cybersecurity Certification": "It is a professional validation that a data center adheres to established standards and best practices for protecting information systems and data from cyber threats, ensuring the confidentiality, integrity, and availability of critical information assets.",
  
  // Additional comprehensive certifications
  "ISO 14001": "ISO 14001, the global standard for environmental management systems (EMS), guides data centers in reducing energy use, managing waste (including electronic waste), and optimizing resources through renewable energy and efficient cooling systems.",
  "SOC 1 Type II": "A SOC 1 Type II report for a data center is an independent audit verifying that internal controls over financial reporting were effectively designed and operated correctly over a specified period, typically six months.",
  "LEED": "LEED for data centers provides a sustainable framework to design, build, and operate energy-intensive facilities, focusing on energy and water efficiency, greenhouse gas reduction, indoor environmental quality, and resource management to reduce environmental impact and costs.",
  "TIA-942 Rated 3": "The TIA-942 Rated 3 data center design standard, also known as Tier III, certifies that the facility offers high availability, fault tolerance, and redundancy, ensuring minimal downtime and reliable operations.",
  "TIA-942 Rated 4": "The TIA-942 Rated-4 is the highest data center rating, ensuring fault tolerance with redundant capacity and independent distribution paths. It prevents downtime from single faults, supports concurrent maintenance, and guarantees 99.995% availability.",
  
  // Location Information
  // "City": "The city where the data center facility is located.",
  // "State": "The state or province where the data center facility is located.",
  // "Country": "The country where the data center facility is located.",
  // "Region": "The geographical region where the data center facility is located (e.g., Africa, Europe, Asia).",
  
  // Additional Fields
  "Information Sources": "The sources from which the data center information was obtained.",
  "Data Center Operator/Facility Address": "The DC Operator Facility Address is the official street address of a data center professionally operated by a specific company or organization.",
};