# Database election for the project

## 1. Introduction

The Calories.fun project requires a robust and secure system to register users by associating their Telegram ID with a wallet address on Zetachain. For this purpose, we have chosen Neon—a serverless PostgreSQL platform—that offers advantages in terms of administration, scalability, and operational efficiency. This document details the justification for the selection, the proposed schema design, pending tasks, and considerations regarding scalability and performance.

## 2. Justification for Choosing Neon with PostgreSQL

### Advantages of Neon:

- **Serverless and Autoscaling:**  
  Neon allows the database to automatically scale according to workload, reducing the need for manual configuration and optimizing costs through its scale-to-zero function when there is no activity. This is ideal for applications that may experience traffic peaks, such as user registration via a Telegram bot.

- **Branching and Development Environments:**  
  The ability to create database branches enables the creation of test, staging, and development environments without incurring extra costs for duplicating storage.

- **Connection and Pooling:**  
  Neon employs PgBouncer to manage up to 10,000 concurrent connections, which optimizes connection latency and improves performance in high-concurrency scenarios.

- **Maintenance and Security:**  
  As a managed solution, Neon reduces the operational burden of database administration by offering automated backups, point-in-time recovery, and simplified compliance with security regulations (e.g., HIPAA).

These features make Neon a modern, efficient, and low-maintenance option for a user registration system in a scalable and secure environment.

## 3. Proposed Database Schema Design

The schema will focus on storing the minimal necessary information for registration and subsequent user interactions while ensuring data integrity and efficiency.

### Main Tables:

1. **users**

   - **id** (SERIAL PRIMARY KEY): Unique identifier for the user.
   - **telegram_id** (BIGINT UNIQUE NOT NULL): Unique Telegram identifier.
   - **wallet_address** (VARCHAR(100) NOT NULL): Associated wallet address.
   - **registration_date** (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Date and time of registration.
   - **status** (VARCHAR(20) DEFAULT 'active'): User status (active, inactive, blocked).

2. **referrals** (managing referrals)
   - **id** (SERIAL PRIMARY KEY)
   - **user_id** (INTEGER REFERENCES users(id)): The user who made the referral.
   - **referred_telegram_id** (BIGINT NOT NULL): Telegram ID of the referred user.
   - **referral_date** (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
   - **valid** (BOOLEAN NOT NULL DEFAULTS FALSE): changes to true when the user perform the pertinent tasks( ie. upload a photo, share on twitter, etc)

### Schema Considerations:

- **Indexes:**  
  It is recommended to create indexes on searchable fields, such as `telegram_id` and `wallet_address`, to optimize query performance.
- **Integrity:**  
  Relationships and constraints (e.g., UNIQUE on telegram_id) ensure data consistency.
- **Scalability:**  
  The modular design allows for adding new tables or columns (for example, transaction history or activity logs) without impacting overall performance.

## 4. Tasks to be Addressed

### Functional Tasks:

- **Implementing Registration:**  
  Develop the logic within the bot to capture the `/start` command, request and validate the wallet address, and register the associated Telegram ID.
- **Data Validation:**  
  Implement validations to ensure the wallet address meets the required format and that the Telegram ID is not duplicated.
- **Referral Management:**  
  Create mechanisms to register and track referred users by generating unique codes or referral links.

### Technical Tasks:

- **Integration with Neon:**  
  Configure the connection to the Neon database using environment variables and the Neon CLI, ensuring the use of connection pooling.
- **Connection Handling:**  
  Optimize the use of PgBouncer and database settings to support traffic spikes without increasing latency.
- **Backup and Recovery:**  
  Establish automated backup tasks and disaster recovery plans.
- **Monitoring and Logging:**  
  Integrate tools to monitor queries, identify bottlenecks, and maintain detailed logs for performance analysis.

## 5. Scalability and Performance Considerations

### Scalability:

- **Autoscaling and Scale-to-Zero:**  
  Neon adapts to demand by increasing resources during peak traffic and reducing them during inactivity, resulting in efficient resource usage and controlled costs.
- **Branching for Environments:**  
  The ability to create multiple environments (development, testing, staging) without duplicating storage costs facilitates continuous testing and deployment.
- **Connection Management:**  
  With support for thousands of concurrent connections via PgBouncer, the system can handle a large number of users without performance degradation.

### Performance:

- **Low Latency:**  
  The separation between compute and storage in Neon significantly reduces query execution latency.
- **Query Optimization:**  
  With proper indexing and continuous monitoring, slow queries can be detected and optimized to enhance overall performance.
- **Automated Maintenance:**  
  Neon’s automated updates, backups, and recovery processes minimize downtime and ensure a rapid response to incidents.

## 6. Conclusion

Choosing Neon with PostgreSQL for the user registration system is based on its robustness, scalability, and operational efficiency. Neon offers a serverless environment that adapts to demand, reduces costs through scale-to-zero, and simplifies the management of development environments with its branching capability. Additionally, the native integration with Node.js, TypeScript, and tools like telegraf guarantees a straightforward and secure implementation.

The proposed schema, centered on the users and referrals tables, provides a solid and scalable foundation, while the identified tasks ensure that both functional and technical requirements are met. With a focus on monitoring, query optimization, and automated maintenance, the system is well-prepared to grow and adapt to future needs without compromising performance.

This solution represents the ideal balance between functionality, scalability, and cost, allowing the team to focus on enhancing the user experience and expanding the Calories.fun project.
