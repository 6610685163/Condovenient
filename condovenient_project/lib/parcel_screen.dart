import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

class ParcelScreen extends StatefulWidget {
  final String userId;
  const ParcelScreen({super.key, required this.userId});

  @override
  State<ParcelScreen> createState() => _ParcelScreenState();
}

class _ParcelScreenState extends State<ParcelScreen> {
  final String _backendUrl = 'http://10.0.2.2:3000';

  List<int> _lockerStatus = List.filled(12, 0);
  List<Map<String, dynamic>> _activeParcels = [];
  List<Map<String, dynamic>> _historyParcels = [];
  bool _isLoading = true;
  String? _errorMessage;
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _loadAll();
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) => _loadAll());
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadAll() async {
    // ตั้ง isLoading = true ก่อน แล้ว set false เมื่อทั้งคู่เสร็จ
    if (mounted) setState(() => _isLoading = true);
    try {
      await Future.wait([
        _loadLockerStatus(),
        _loadUserParcels(),
      ]);
    } finally {
      // ไม่ว่าจะสำเร็จหรือ error ก็ต้องหยุด loading
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _loadLockerStatus() async {
    try {
      final response = await http.get(
        Uri.parse('$_backendUrl/api/parcel/status'),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && mounted) {
          setState(() {
            _lockerStatus = List<int>.from(
              data['lockerStatus'] ?? List.filled(12, 0),
            );
          });
        }
      }
    } catch (e) {
      debugPrint('loadLockerStatus error: $e');
      // ไม่ throw เพราะ Future.wait จะ cancel อีกตัว
    }
  }

  Future<void> _loadUserParcels() async {
    if (widget.userId.isEmpty) return;
    try {
      final response = await http.get(
        Uri.parse('$_backendUrl/api/parcel/user/${widget.userId}'),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && mounted) {
          final all = List<Map<String, dynamic>>.from(data['parcels'] ?? []);
          setState(() {
            _activeParcels = all.where((p) => p['status'] == 'arrived').toList();
            _historyParcels = all.where((p) => p['status'] == 'picked_up').toList();
            _errorMessage = null;
          });
        }
      } else {
        if (mounted) setState(() => _errorMessage = 'ไม่สามารถโหลดข้อมูลพัสดุได้');
      }
    } catch (e) {
      debugPrint('loadUserParcels error: $e');
      if (mounted) setState(() => _errorMessage = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  }

  void _showPickupQRCode(String parcelId, String carrier, String lockerNumber) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final response = await http.post(
        Uri.parse('$_backendUrl/api/parcel/generate-qr'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'userId': widget.userId, 'parcelId': parcelId}),
      ).timeout(const Duration(seconds: 10));

      if (mounted) Navigator.pop(context);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && mounted) {
          final String qrData = Uri.encodeComponent(data['qrData']);
          _showQRDialog(parcelId, carrier, lockerNumber, qrData);
        }
      } else {
        final data = jsonDecode(response.body);
        if (mounted) _showSnack(data['message'] ?? 'เกิดข้อผิดพลาด');
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        _showSnack('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      }
    }
  }

  void _showQRDialog(String parcelId, String carrier, String lockerNumber, String qrData) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Center(child: Text('Scan to Open Locker #$lockerNumber')),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'พัสดุจาก: $carrier',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            const Text(
              'กรุณานำ QR Code ไปสแกนที่ตู้ Locker',
              style: TextStyle(color: Colors.grey, fontSize: 13),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            Container(
              width: 200, height: 200,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.black, width: 2),
                borderRadius: BorderRadius.circular(8),
                image: DecorationImage(
                  image: NetworkImage(
                    'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=$qrData',
                  ),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.red[50],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '⏱ หมดอายุใน 10 นาที',
                style: TextStyle(
                  color: Colors.red[600],
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('ปิด'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await _confirmPickup(parcelId);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            child: const Text('ยืนยันรับพัสดุ', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmPickup(String parcelId) async {
    try {
      final response = await http.patch(
        Uri.parse('$_backendUrl/api/parcel/pickup/$parcelId'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        if (mounted) {
          _showSnack('✅ รับพัสดุสำเร็จ!');
          _loadAll();
        }
      }
    } catch (e) {
      if (mounted) _showSnack('เกิดข้อผิดพลาด: $e');
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: const Text('Parcel & Locker', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _isLoading ? null : _loadAll,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadAll,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // แสดง error banner ถ้ามี
                    if (_errorMessage != null)
                      Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.orange[50],
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.orange[200]!),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.wifi_off, color: Colors.orange, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(color: Colors.orange, fontSize: 13),
                              ),
                            ),
                          ],
                        ),
                      ),
                    _buildSectionTitle('🗄 Smart Locker Status'),
                    const SizedBox(height: 12),
                    _buildLockerGrid(),
                    const SizedBox(height: 8),
                    _buildLockerLegend(),
                    const SizedBox(height: 28),
                    _buildSectionTitle('📦 พัสดุรอรับ (${_activeParcels.length})'),
                    const SizedBox(height: 12),
                    _activeParcels.isEmpty
                        ? _buildEmptyState('ยังไม่มีพัสดุรอรับ')
                        : Column(children: _activeParcels.map(_buildParcelCard).toList()),
                    if (_historyParcels.isNotEmpty) ...[
                      const SizedBox(height: 28),
                      _buildSectionTitle('✅ ประวัติการรับพัสดุ'),
                      const SizedBox(height: 12),
                      Column(children: _historyParcels.take(5).map(_buildHistoryCard).toList()),
                    ],
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildSectionTitle(String text) => Text(
        text,
        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
      );

  Widget _buildLockerGrid() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 1,
      ),
      itemCount: _lockerStatus.length,
      itemBuilder: (context, index) {
        final status = _lockerStatus[index];
        Color bgColor = Colors.white;
        Color borderColor = Colors.grey[300]!;
        IconData? icon;
        Color iconColor = Colors.grey;

        // หาพัสดุที่ตรงกับตู้นี้ (ของลูกบ้านคนนี้)
        final matchParcel = _activeParcels.firstWhere(
          (p) => p['lockerNumber'] == '${index + 1}',
          orElse: () => {},
        );

        final isMyParcel = matchParcel.isNotEmpty;

        if (isMyParcel) {
          bgColor = Colors.blue[50]!;
          borderColor = Colors.blue;
          icon = Icons.inventory_2;
          iconColor = Colors.blue;
        } else if (status == 1) {
          bgColor = Colors.grey[200]!;
          borderColor = Colors.grey;
          icon = Icons.lock_outline;
          iconColor = Colors.grey;
        }

        return GestureDetector(
          onTap: isMyParcel
              ? () => _showPickupQRCode(
                    matchParcel['id'],
                    matchParcel['carrier'] ?? 'ขนส่ง',
                    '${index + 1}',
                  )
              : null,
          child: Container(
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: borderColor, width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                )
              ],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null)
                  Icon(icon, color: iconColor, size: 22)
                else
                  Text(
                    '${index + 1}',
                    style: const TextStyle(
                      color: Colors.grey,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                const SizedBox(height: 2),
                Text(
                  '${index + 1}',
                  style: TextStyle(fontSize: 10, color: iconColor.withOpacity(0.7)),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildLockerLegend() {
    return Row(
      children: [
        _legendItem(Colors.blue[50]!, Colors.blue, 'ของฉัน'),
        const SizedBox(width: 16),
        _legendItem(Colors.grey[200]!, Colors.grey, 'ไม่ว่าง'),
        const SizedBox(width: 16),
        _legendItem(Colors.white, Colors.grey[300]!, 'ว่าง'),
      ],
    );
  }

  Widget _legendItem(Color bg, Color border, String label) {
    return Row(
      children: [
        Container(
          width: 16, height: 16,
          decoration: BoxDecoration(
            color: bg,
            border: Border.all(color: border),
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
      ],
    );
  }

  Widget _buildParcelCard(Map<String, dynamic> parcel) {
    final arrivedAt = parcel['arrivedAt'] != null
        ? DateTime.tryParse(parcel['arrivedAt'])
        : null;
    final timeStr = arrivedAt != null
        ? '${arrivedAt.day}/${arrivedAt.month}/${arrivedAt.year} ${arrivedAt.hour.toString().padLeft(2, '0')}:${arrivedAt.minute.toString().padLeft(2, '0')}'
        : 'ไม่ทราบเวลา';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 6, offset: const Offset(0, 2))
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.blue[50],
            child: const Icon(Icons.local_shipping, color: Colors.blue),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  parcel['carrier'] ?? 'ขนส่ง',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                Text(
                  'Locker #${parcel['lockerNumber']}',
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
                Text(timeStr, style: const TextStyle(color: Colors.grey, fontSize: 11)),
              ],
            ),
          ),
          ElevatedButton.icon(
            onPressed: () => _showPickupQRCode(
              parcel['id'],
              parcel['carrier'] ?? 'ขนส่ง',
              parcel['lockerNumber'] ?? '?',
            ),
            icon: const Icon(Icons.qr_code, size: 16),
            label: const Text('QR Code', style: TextStyle(fontSize: 12)),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryCard(Map<String, dynamic> parcel) {
    final pickedAt = parcel['pickedUpAt'] != null
        ? DateTime.tryParse(parcel['pickedUpAt'])
        : null;
    final timeStr = pickedAt != null
        ? '${pickedAt.day}/${pickedAt.month}/${pickedAt.year}'
        : '';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          const Icon(Icons.check_circle, color: Colors.green, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  parcel['carrier'] ?? 'ขนส่ง',
                  style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
                ),
                Text(
                  'Locker #${parcel['lockerNumber']} • รับแล้ว $timeStr',
                  style: const TextStyle(color: Colors.grey, fontSize: 11),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.green[50],
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Text(
              'รับแล้ว',
              style: TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(String msg) {
    return Container(
      padding: const EdgeInsets.all(32),
      alignment: Alignment.center,
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
      child: Column(
        children: [
          const Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey),
          const SizedBox(height: 8),
          Text(msg, style: const TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}
