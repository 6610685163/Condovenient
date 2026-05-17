import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class NotificationScreen extends StatefulWidget {
  final String userId;
  const NotificationScreen({super.key, this.userId = ''});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  final String _backendUrl = 'http://10.0.2.2:3000';

  List<Map<String, dynamic>> _notifications = [];
  bool _loading = true;
  String _error = '';
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
    _pollTimer = Timer.periodic(const Duration(seconds: 30), (_) => _fetchNotifications());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchNotifications() async {
    if (widget.userId.isEmpty) {
      setState(() {
        _loading = false;
        _error = 'ไม่พบ User ID';
      });
      return;
    }
    try {
      final response = await http
          .get(Uri.parse('$_backendUrl/api/auth/notifications/${widget.userId}'))
          .timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && mounted) {
          final list = List<Map<String, dynamic>>.from(data['notifications'] ?? []);
          setState(() {
            _notifications = list;
            _loading = false;
            _error = '';
          });
        }
      } else {
        if (mounted) setState(() { _loading = false; _error = 'โหลดแจ้งเตือนไม่สำเร็จ'; });
      }
    } catch (e) {
      if (mounted) setState(() { _loading = false; _error = 'เชื่อมต่อ Server ไม่สำเร็จ'; });
    }
  }

  Future<void> _markRead(String id) async {
    try {
      await http.patch(Uri.parse('$_backendUrl/api/auth/notifications/$id/read'));
    } catch (_) {}
  }

  Future<void> _markAllRead() async {
    for (final n in _notifications) {
      if (n['isRead'] == false && n['id'] != null) {
        await _markRead(n['id']);
      }
    }
    _fetchNotifications();
  }

  IconData _iconFor(Map<String, dynamic> n) {
    final type = (n['type'] ?? '').toString();
    if (type.startsWith('repair')) return Icons.build_circle_outlined;
    if (type == 'payment') return Icons.check_circle_outline;
    if (type == 'parcel')  return Icons.inventory_2_outlined;
    return Icons.notifications_outlined;
  }

  String _formatTime(dynamic ts) {
    if (ts == null) return '';
    try {
      DateTime dt;
      if (ts is Map && ts['_seconds'] != null) {
        dt = DateTime.fromMillisecondsSinceEpoch((ts['_seconds'] as int) * 1000);
      } else if (ts is String) {
        dt = DateTime.parse(ts);
      } else {
        return '';
      }
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 1) return 'เมื่อสักครู่';
      if (diff.inMinutes < 60) return '${diff.inMinutes} นาทีที่แล้ว';
      if (diff.inHours < 24) return '${diff.inHours} ชั่วโมงที่แล้ว';
      if (diff.inDays < 7) return '${diff.inDays} วันที่แล้ว';
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) { return ''; }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Text('Notifications', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E1E1E),
        foregroundColor: Colors.amber,
        elevation: 0,
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: _markAllRead,
            child: const Text('Read All', style: TextStyle(color: Colors.amber)),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchNotifications,
        color: Colors.amber,
        backgroundColor: const Color(0xFF1E1E1E),
        child: _loading
            ? const Center(child: CircularProgressIndicator(color: Colors.amber))
            : _error.isNotEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline, size: 56, color: Colors.grey[700]),
                        const SizedBox(height: 12),
                        Text(_error, style: const TextStyle(color: Colors.grey)),
                      ],
                    ),
                  )
                : _notifications.isEmpty
                    ? ListView(
                        children: [
                          const SizedBox(height: 160),
                          Center(
                            child: Column(
                              children: [
                                Icon(Icons.notifications_off_outlined,
                                    size: 64, color: Colors.grey[800]),
                                const SizedBox(height: 16),
                                const Text('ไม่มีการแจ้งเตือน',
                                    style: TextStyle(color: Colors.grey)),
                              ],
                            ),
                          ),
                        ],
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        itemCount: _notifications.length,
                        itemBuilder: (context, index) {
                          final n = _notifications[index];
                          return _buildNotificationItem(n);
                        },
                      ),
      ),
    );
  }

  Widget _buildNotificationItem(Map<String, dynamic> n) {
    final isRead = n['isRead'] == true;

    return InkWell(
      onTap: () {
        if (!isRead && n['id'] != null) {
          _markRead(n['id']).then((_) => _fetchNotifications());
        }
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isRead ? const Color(0xFF1E1E1E) : const Color(0xFF262626),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isRead ? const Color(0xFF2A2A2A) : Colors.amber.withOpacity(0.3),
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
              child: Icon(_iconFor(n), color: Colors.amber, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          n['title']?.toString() ?? '',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      if (!isRead)
                        Container(
                          width: 8, height: 8,
                          decoration: const BoxDecoration(
                            color: Colors.amber, shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    n['message']?.toString() ?? '',
                    style: const TextStyle(color: Colors.grey, fontSize: 13, height: 1.4),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _formatTime(n['createdAt']),
                    style: TextStyle(color: Colors.grey[600], fontSize: 11),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}