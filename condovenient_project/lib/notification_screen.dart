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

  final Set<String> _ratedTicketIds = {};

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
      setState(() { _loading = false; _error = 'ไม่พบ User ID'; });
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
          setState(() { _notifications = list; _loading = false; _error = ''; });
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

  Future<void> _showRepairDetail(Map<String, dynamic> notif) async {
    if (notif['isRead'] == false && notif['id'] != null) {
      await _markRead(notif['id']);
    }
    if (!mounted) return;

    final ticketId = notif['ticketId'] as String?;
    Map<String, dynamic>? ticket;
    if (ticketId != null) {
      try {
        final res = await http
            .get(Uri.parse('$_backendUrl/api/repair/list/${widget.userId}'))
            .timeout(const Duration(seconds: 8));
        if (res.statusCode == 200) {
          final list = List<Map<String, dynamic>>.from(jsonDecode(res.body));
          ticket = list.firstWhere(
            (t) => t['id'] == ticketId,
            orElse: () => <String, dynamic>{},
          );
          if (ticket.isEmpty) ticket = null;
        }
      } catch (_) {}
    }

    if (!mounted) return;
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: const Color(0xFF1E1E1E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.build_circle, color: Colors.amber, size: 28),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text('รายละเอียดงานซ่อม',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.grey),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const Divider(color: Color(0xFF2A2A2A)),
              _detailRow('หัวข้อ', ticket?['title'] ?? notif['ticketTitle'] ?? '-'),
              _detailRow('หมวดหมู่', ticket?['category'] ?? '-'),
              _detailRow('ห้อง', ticket?['roomNumber'] ?? '-'),
              _detailRow('ช่างที่ดูแล', notif['technicianName'] ?? ticket?['technicianName'] ?? '-'),
              _detailRow('สถานะ', ticket?['status'] ?? 'completed'),
              if ((ticket?['completionNote'] ?? '').toString().isNotEmpty)
                _detailRow('บันทึกการซ่อม', ticket!['completionNote']),
              const SizedBox(height: 16),
              if (notif['requiresRating'] == true &&
                  !_ratedTicketIds.contains(ticketId) &&
                  (ticket?['ratingId'] == null))
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(ctx);
                      _openRatingDialog(notif);
                    },
                    icon: const Icon(Icons.star),
                    label: const Text('ให้คะแนนช่าง'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.amber,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailRow(String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          ),
          Expanded(
            child: Text(
              value?.toString() ?? '-',
              style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openRatingDialog(Map<String, dynamic> notif) async {
    final ticketId = notif['ticketId'] as String?;
    if (ticketId == null) return;

    int score = 5;
    final commentCtrl = TextEditingController();
    bool submitting = false;
    String dialogError = '';

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(builder: (ctx, setLocal) {
        return Dialog(
          backgroundColor: const Color(0xFF1E1E1E),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.star_rounded, color: Colors.amber, size: 56),
                const SizedBox(height: 8),
                const Text('ให้คะแนนช่าง',
                  style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(notif['technicianName']?.toString() ?? 'ช่าง',
                  style: const TextStyle(color: Colors.grey, fontSize: 14)),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (i) {
                    final filled = i < score;
                    return IconButton(
                      iconSize: 40,
                      onPressed: () => setLocal(() => score = i + 1),
                      icon: Icon(
                        filled ? Icons.star_rounded : Icons.star_outline_rounded,
                        color: filled ? Colors.amber : Colors.grey,
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: commentCtrl,
                  maxLines: 3,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'แสดงความคิดเห็น (ไม่บังคับ)',
                    hintStyle: const TextStyle(color: Colors.grey),
                    filled: true,
                    fillColor: const Color(0xFF2A2A2A),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                if (dialogError.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(dialogError, style: const TextStyle(color: Colors.red, fontSize: 13)),
                ],
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: submitting ? null : () => Navigator.pop(ctx),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.grey),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('ภายหลัง', style: TextStyle(color: Colors.grey)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: submitting ? null : () async {
                          setLocal(() { submitting = true; dialogError = ''; });
                          try {
                            final res = await http.post(
                              Uri.parse('$_backendUrl/api/ratings'),
                              headers: {'Content-Type': 'application/json'},
                              body: jsonEncode({
                                'ticketId': ticketId,
                                'userId': widget.userId,
                                'score': score,
                                'comment': commentCtrl.text.trim(),
                              }),
                            );
                            final data = jsonDecode(res.body);
                            if (res.statusCode == 201 && data['success'] == true) {
                              _ratedTicketIds.add(ticketId);
                              if (notif['id'] != null) {
                                await _markRead(notif['id']);
                              }
                              if (mounted) Navigator.pop(ctx);
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('ขอบคุณสำหรับ feedback!'),
                                    backgroundColor: Colors.green,
                                  ),
                                );
                              }
                              _fetchNotifications();
                            } else {
                              setLocal(() {
                                dialogError = data['message'] ?? data['error'] ?? 'ส่งคะแนนไม่สำเร็จ';
                                submitting = false;
                              });
                            }
                          } catch (e) {
                            setLocal(() {
                              dialogError = 'เชื่อมต่อ Server ไม่สำเร็จ';
                              submitting = false;
                            });
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.amber,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: submitting
                            ? const SizedBox(
                                width: 18, height: 18,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                              )
                            : const Text('ส่งคะแนน', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      }),
    );
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
    final type = (n['type'] ?? '').toString();
    final needsRating = n['requiresRating'] == true
        && !_ratedTicketIds.contains(n['ticketId']);
    final isRepairCompleted = type == 'repair_completed';

    return InkWell(
      onTap: () {
        if (isRepairCompleted) {
          _showRepairDetail(n);
        } else if (!isRead && n['id'] != null) {
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
                  if (isRepairCompleted) ...[
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _showRepairDetail(n),
                            icon: const Icon(Icons.info_outline, size: 16),
                            label: const Text('ดูรายละเอียด'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.amber,
                              side: const BorderSide(color: Colors.amber),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                          ),
                        ),
                        if (needsRating) ...[
                          const SizedBox(width: 8),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => _openRatingDialog(n),
                              icon: const Icon(Icons.star, size: 16),
                              label: const Text('ให้คะแนน'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.amber,
                                foregroundColor: Colors.black,
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}