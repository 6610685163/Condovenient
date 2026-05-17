import 'package:flutter/material.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  final List<Map<String, dynamic>> _notifications = [
    {
      'title': 'ชำระเงินสำเร็จ',
      'desc': 'ยอดชำระค่าส่วนกลางเดือน ก.พ. 5,250 บาท ได้รับการยืนยันแล้ว',
      'time': '2 นาทีที่แล้ว',
      'type': Icons.check_circle_outline,
      'isRead': false,
    },
    {
      'title': 'พัสดุมาถึงแล้ว',
      'desc': 'มีพัสดุจาก Kerry Express มาส่งที่ตู้ Locker #1',
      'time': '1 ชั่วโมงที่แล้ว',
      'type': Icons.inventory_2_outlined,
      'isRead': false,
    },
    {
      'title': 'แจ้งเตือนน้ำประปาไหลอ่อน',
      'desc':
          'อาคาร A จะมีน้ำไหลอ่อนเนื่องจากมีการล้างถังพักน้ำ เวลา 13:00 - 15:00',
      'time': '3 ชั่วโมงที่แล้ว',
      'type': Icons.water_drop_outlined,
      'isRead': true,
    },
    {
      'title': 'อัปเดตสถานะการแจ้งซ่อม',
      'desc': 'คำขอแจ้งซ่อม "แอร์น้ำหยด" ของคุณได้รับการมอบหมายให้ช่างแล้ว',
      'time': 'เมื่อวานนี้',
      'type': Icons.build_circle_outlined,
      'isRead': true,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Text(
          'Notifications',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFF1E1E1E),
        foregroundColor: Colors.amber,
        elevation: 0,
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                for (var n in _notifications) {
                  n['isRead'] = true;
                }
              });
            },
            child: const Text(
              'Read All',
              style: TextStyle(color: Colors.amber),
            ),
          ),
        ],
      ),
      body: _notifications.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.notifications_off_outlined,
                    size: 64,
                    color: Colors.grey[800],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'ไม่มีการแจ้งเตือนใหม่',
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 12),
              itemCount: _notifications.length,
              itemBuilder: (context, index) {
                final item = _notifications[index];
                return _buildNotificationItem(item);
              },
            ),
    );
  }

  Widget _buildNotificationItem(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: item['isRead']
            ? const Color(0xFF1E1E1E)
            : const Color(0xFF262626),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: item['isRead']
              ? const Color(0xFF2A2A2A)
              : Colors.amber.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(item['type'], color: Colors.amber, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      item['title'],
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: item['isRead']
                            ? FontWeight.normal
                            : FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                    if (!item['isRead'])
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Colors.amber,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  item['desc'],
                  style: const TextStyle(
                    color: Colors.grey,
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  item['time'],
                  style: TextStyle(color: Colors.grey[600], fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
