-- ---------------------------------------------------------------------------
-- WEDDING MAP - seed data
--
-- Optional: run this after schema.sql if you want the Supabase database
-- pre-populated with the same kind of sample data the app uses in mock mode
-- (src/data/mockWeddingHalls.ts). All names are fictional placeholders -
-- replace with real venues once you start managing real data.
-- ---------------------------------------------------------------------------

insert into public.wedding_halls
  (name, region, district, address, latitude, longitude, main_image, images, homepage, phone,
   open_until, tags, minimum_guests, sunday_evening_guests, rental_fee, meal_price,
   negotiable, negotiable_memo, ceremony_type, hall_count, parking_capacity, parking_info,
   subway_info, description, rating, review_count)
values
  ('그랜드컨벤션 웨딩홀', 'seoul', '강남구', '서울특별시 강남구 ○○로 100', 37.5172, 127.0473,
   'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
   array['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80'],
   'https://example.com/wedding-hall-0', '02-1000-5000', '11월까지오픈',
   array['분리예식', '11월까지오픈'], 250, 200, 9000000, 90000, true, '방문시 조율 가능',
   '분리예식', 3, 500, '건물 내 지하주차장 이용 (발렛 가능)', '2호선 강남역 인근', '서울 강남구에 위치한 프리미엄 웨딩홀입니다.', 4.8, 124),

  ('라움가든 웨딩홀', 'seoul', '강서구', '서울특별시 강서구 ○○로 102', 37.5509, 126.8495,
   'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
   array['https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80'],
   'https://example.com/wedding-hall-1', '02-1001-5001', null,
   array['동시예식'], 150, null, 5000000, 65000, false, null,
   '동시예식', 2, null, null, null, '서울 강서구에 위치한 프리미엄 웨딩홀입니다.', 4.5, 98),

  ('더화이트베일', 'seoul', '송파구', '서울특별시 송파구 ○○로 104', 37.5145, 127.1058,
   'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
   array['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'],
   'https://example.com/wedding-hall-2', '02-1002-5002', null,
   array['분리예식'], 200, 150, 6500000, 70000, true, '방문시 조율 가능',
   '분리예식', 3, 400, '지상 및 지하 주차 가능', '8호선 인근', '서울 송파구에 위치한 프리미엄 웨딩홀입니다.', 4.5, 98),

  ('베르사체홀 웨딩', 'seoul', '영등포구', '서울특별시 영등포구 ○○로 106', 37.5264, 126.8963,
   'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
   array['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80'],
   null, null, '11월까지오픈',
   array['동시예식', '11월까지오픈'], 300, 250, 8000000, 100000, false, null,
   '동시예식', 4, 300, '주차 협소, 발렛 권장', null, '서울 영등포구에 위치한 프리미엄 웨딩홀입니다.', 4.6, 112),

  ('더테일러 웨딩홀', 'seoul', '마포구', '서울특별시 마포구 ○○로 108', 37.5663, 126.9019,
   'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80',
   array['https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80'],
   'https://example.com/wedding-hall-4', '02-1004-5004', null,
   array['분리예식'], 100, null, 4000000, 55000, true, '방문시 조율 가능',
   '분리예식', 1, 200, '건물 내 주차', '6호선 인근', '서울 마포구에 위치한 프리미엄 웨딩홀입니다.', 4.4, 76),

  ('이든가든 웨딩홀', 'seoul', '용산구', '서울특별시 용산구 ○○로 110', 37.5326, 126.9903,
   'https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=800&q=80',
   array['https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=800&q=80'],
   'https://example.com/wedding-hall-5', null, null,
   array['동시예식'], 150, 100, 5500000, 60000, false, null,
   '동시예식', 2, null, null, '4호선 인근', '서울 용산구에 위치한 프리미엄 웨딩홀입니다.', 4.3, 65),

  ('스카이라인컨벤션', 'seoul', '종로구', '서울특별시 종로구 ○○로 112', 37.5735, 126.9788,
   'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
   array['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80'],
   'https://example.com/wedding-hall-6', '02-1006-5006', '11월까지오픈',
   array['분리예식', '11월까지오픈'], 200, 150, 7000000, 80000, true, '방문시 조율 가능',
   '분리예식', 3, 350, '지하 주차장 완비', '1호선 인근', '서울 종로구에 위치한 프리미엄 웨딩홀입니다.', 4.7, 140),

  ('올리브가든 웨딩', 'gyeonggi', '성남시', '경기도 성남시 ○○로 114', 37.4201, 127.1262,
   'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
   array['https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80'],
   'https://example.com/wedding-hall-7', '031-1007-5007', null,
   array['동시예식'], 150, null, 4500000, 55000, false, null,
   '동시예식', 2, 300, '무료 주차 300대', '분당선 인근', '경기 성남시에 위치한 프리미엄 웨딩홀입니다.', 4.2, 54),

  ('더포레스트 웨딩', 'gyeonggi', '수원시', '경기도 수원시 ○○로 116', 37.2636, 127.0286,
   'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
   array['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'],
   null, '031-1008-5008', null,
   array['분리예식'], 100, 80, 3500000, 50000, true, '방문시 조율 가능',
   '분리예식', 1, 250, '건물 내 지하주차장', null, '경기 수원시에 위치한 프리미엄 웨딩홀입니다.', 4.1, 40),

  ('라비앙로즈 웨딩홀', 'gyeonggi', '용인시', '경기도 용인시 ○○로 118', 37.2411, 127.1776,
   'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
   array['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80'],
   'https://example.com/wedding-hall-9', null, '11월까지오픈',
   array['동시예식', '11월까지오픈'], 200, 150, 6000000, 65000, false, null,
   '동시예식', 3, null, null, null, '경기 용인시에 위치한 프리미엄 웨딩홀입니다.', 4.4, 88),

  ('더뮤즈 웨딩홀', 'gyeonggi', '고양시', '경기도 고양시 ○○로 120', 37.6584, 126.8320,
   'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80',
   array['https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80'],
   'https://example.com/wedding-hall-10', '031-1010-5010', null,
   array['분리예식'], 250, 200, 7500000, 75000, true, '방문시 조율 가능',
   '분리예식', 3, 450, '대형 주차장 완비', '3호선 인근', '경기 고양시에 위치한 프리미엄 웨딩홀입니다.', 4.6, 102),

  ('센텀웨딩컨벤션', 'gyeonggi', '부천시', '경기도 부천시 ○○로 122', 37.5034, 126.7660,
   'https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=800&q=80',
   array['https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=800&q=80'],
   null, '032-1011-5011', null,
   array['동시예식'], 150, null, 4800000, 58000, false, null,
   '동시예식', 2, 200, null, null, '경기 부천시에 위치한 프리미엄 웨딩홀입니다.', 4.0, 33),

  ('더클래식가든', 'gyeonggi', '안양시', '경기도 안양시 ○○로 124', 37.3943, 126.9568,
   'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
   array['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80'],
   'https://example.com/wedding-hall-12', '031-1012-5012', '11월까지오픈',
   array['분리예식', '11월까지오픈'], 300, 250, 8500000, 95000, true, '방문시 조율 가능',
   '분리예식', 4, 500, '지상/지하 대형 주차장', '4호선 인근', '경기 안양시에 위치한 프리미엄 웨딩홀입니다.', 4.7, 118),

  ('아펠가모 웨딩홀', 'incheon', '남동구', '인천광역시 남동구 ○○로 126', 37.4467, 126.7314,
   'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
   array['https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80'],
   'https://example.com/wedding-hall-13', '032-1013-5013', null,
   array['동시예식'], 150, 120, 4200000, 52000, false, null,
   '동시예식', 2, 250, '무료 주차', null, '인천 남동구에 위치한 프리미엄 웨딩홀입니다.', 4.2, 47),

  ('더채플 웨딩홀', 'incheon', '연수구', '인천광역시 연수구 ○○로 128', 37.4100, 126.6784,
   'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
   array['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'],
   null, null, null,
   array['분리예식'], 100, null, 3800000, 48000, true, '방문시 조율 가능',
   '분리예식', 1, null, null, 'GTX-B 인근 예정', '인천 연수구에 위치한 프리미엄 웨딩홀입니다.', 4.1, 38),

  ('아이리스컨벤션', 'incheon', '부평구', '인천광역시 부평구 ○○로 130', 37.5074, 126.7217,
   'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
   array['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80'],
   'https://example.com/wedding-hall-15', '032-1015-5015', '11월까지오픈',
   array['동시예식', '11월까지오픈'], 200, 150, 6200000, 68000, false, null,
   '동시예식', 3, 300, '건물 내 주차', '1호선 부평역 인근', '인천 부평구에 위치한 프리미엄 웨딩홀입니다.', 4.5, 91);
