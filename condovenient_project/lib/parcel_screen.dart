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
    _refreshTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _loadAll(),
    );
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadAll() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      await Future.wait([_loadLockerStatus(), _loadUserParcels()]);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _loadLockerStatus() async {
    try {
      final response = await http
          .get(Uri.parse('$_backendUrl/api/parcel/status'))
          .timeout(const Duration(seconds: 10));
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
    }
  }

  Future<void> _loadUserParcels() async {
    if (widget.userId.isEmpty) return;
    try {
      final response = await http
          .get(Uri.parse('$_backendUrl/api/parcel/user/${widget.userId}'))
          .timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && mounted) {
          final all = List<Map<String, dynamic>>.from(data['parcels'] ?? []);
          setState(() {
            _activeParcels = all
                .where((p) => p['status'] == 'arrived')
                .toList();
            _historyParcels = all
                .where((p) => p['status'] == 'picked_up')
                .toList();
            _errorMessage = null;
          });
        }
      } else {
        if (mounted)
          setState(() => _errorMessage = 'ไม่สามารถโหลดข้อมูลพัสดุได้');
      }
    } catch (e) {
      if (mounted)
        setState(() => _errorMessage = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  }

  void _showPickupQRCode(
    String parcelId,
    String carrier,
    String lockerNumber,
  ) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) =>
          const Center(child: CircularProgressIndicator(color: Colors.amber)),
    );
    try {
      final response = await http
          .post(
            Uri.parse('$_backendUrl/api/parcel/generate-qr'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'userId': widget.userId, 'parcelId': parcelId}),
          )
          .timeout(const Duration(seconds: 10));
      if (mounted) Navigator.pop(context);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && mounted) {
          final String qrData = Uri.encodeComponent(data['qrData']);
          _showQRDialog(parcelId, carrier, lockerNumber, qrData);
        }
      } else {
        if (mounted)
          _showSnack(jsonDecode(response.body)['message'] ?? 'เกิดข้อผิดพลาด');
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        _showSnack('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      }
    }
  }

  void _showQRDialog(
    String parcelId,
    String carrier,
    String lockerNumber,
    String qrData,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF2A2A2A)),
        ),
        title: Center(
          child: Text(
            'Scan to Open Locker #$lockerNumber',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'พัสดุจาก: $carrier',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.amber,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'สแกน QR Code นี้ที่ตู้เพื่อเปิดรับพัสดุ',
              style: TextStyle(color: Colors.grey, fontSize: 13),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            Container(
              width: 200,
              height: 200,
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Image.network(
                'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=$qrData',
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                '⏱ หมดอายุใน 10 นาที',
                style: TextStyle(
                  color: Colors.redAccent,
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
            child: const Text('ปิด', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await _confirmPickup(parcelId);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber,
              foregroundColor: Colors.black,
            ),
            child: const Text(
              'ยืนยันรับพัสดุ',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmPickup(String parcelId) async {
    try {
      final response = await http
          .patch(
            Uri.parse('$_backendUrl/api/parcel/pickup/$parcelId'),
            headers: {'Content-Type': 'application/json'},
          )
          .timeout(const Duration(seconds: 10));
      if (response.statusCode == 200 && mounted) {
        _showSnack('✅ รับพัสดุสำเร็จ!');
        _loadAll();
      }
    } catch (e) {
      if (mounted) _showSnack('เกิดข้อผิดพลาด: $e');
    }
  }

  void _showSnack(String msg) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Text(
          'Parcel & Locker',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        elevation: 0,
        backgroundColor: const Color(0xFF1E1E1E),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.amber),
            onPressed: _isLoading ? null : _loadAll,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.amber))
          : RefreshIndicator(
              onRefresh: _loadAll,
              color: Colors.amber,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_errorMessage != null)
                      Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.redAccent),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.wifi_off,
                              color: Colors.redAccent,
                              size: 18,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(
                                  color: Colors.redAccent,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    const Text(
                      '🗄 Smart Locker Status',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildLockerGrid(),
                    const SizedBox(height: 8),
                    _buildLockerLegend(),
                    const SizedBox(height: 28),
                    Text(
                      '📦 พัสดุรอรับ (${_activeParcels.length})',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _activeParcels.isEmpty
                        ? _buildEmptyState('ยังไม่มีพัสดุรอรับ')
                        : Column(
                            children: _activeParcels
                                .map(_buildParcelCard)
                                .toList(),
                          ),
                    if (_historyParcels.isNotEmpty) ...[
                      const SizedBox(height: 28),
                      const Text(
                        '✅ ประวัติการรับพัสดุ',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Column(
                        children: _historyParcels
                            .take(5)
                            .map(_buildHistoryCard)
                            .toList(),
                      ),
                    ],
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
    );
  }

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
        Color bgColor = const Color(0xFF1E1E1E);
        Color borderColor = const Color(0xFF2A2A2A);
        IconData? icon;
        Color iconColor = Colors.grey;

        final matchParcel = _activeParcels.firstWhere(
          (p) => p['lockerNumber'] == '${index + 1}',
          orElse: () => {},
        );
        final isMyParcel = matchParcel.isNotEmpty;

        if (isMyParcel) {
          bgColor = Colors.amber.withOpacity(0.15);
          borderColor = Colors.amber;
          icon = Icons.inventory_2_rounded;
          iconColor = Colors.amber;
        } else if (status == 1) {
          bgColor = const Color(0xFF2A2A2A);
          borderColor = const Color(0xFF333333);
          icon = Icons.lock_outline_rounded;
          iconColor = Colors.grey[600]!;
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
                  style: TextStyle(
                    fontSize: 10,
                    color: iconColor.withOpacity(0.7),
                  ),
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
        _legendItem(Colors.amber.withOpacity(0.15), Colors.amber, 'ของฉัน'),
        const SizedBox(width: 16),
        _legendItem(
          const Color(0xFF2A2A2A),
          const Color(0xFF333333),
          'ไม่ว่าง',
        ),
        const SizedBox(width: 16),
        _legendItem(const Color(0xFF1E1E1E), const Color(0xFF2A2A2A), 'ว่าง'),
      ],
    );
  }

  Widget _legendItem(Color bg, Color border, String label) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
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
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2A2A2A)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.amber.withOpacity(0.1),
            child: const Icon(
              Icons.local_shipping_rounded,
              color: Colors.amber,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  parcel['carrier'] ?? 'ขนส่ง',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'Locker #${parcel['lockerNumber']}',
                  style: const TextStyle(
                    color: Colors.amber,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  timeStr,
                  style: const TextStyle(color: Colors.grey, fontSize: 11),
                ),
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
            label: const Text(
              'QR Code',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
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
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF2A2A2A)),
      ),
      child: Row(
        children: [
          const Icon(Icons.check_circle, color: Colors.greenAccent, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  parcel['carrier'] ?? 'ขนส่ง',
                  style: const TextStyle(
                    fontWeight: FontWeight.w500,
                    fontSize: 13,
                    color: Colors.white,
                  ),
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
              color: Colors.greenAccent.withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Text(
              'รับแล้ว',
              style: TextStyle(
                color: Colors.greenAccent,
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
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
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2A2A2A)),
      ),
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
