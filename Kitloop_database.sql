--
-- PostgreSQL database dump
--

\restrict zCdibaSDzhThOMZclTiUmWpPjDyHttmcV5hA4zNY1KY2tbzW6mYDzlb8imfxM4F

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-07-24 18:29:55

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ecf60796-fec8-495f-aa83-fefe57662ead	965aee7d945b648c52f34a87c3665730391322d8b5e6a3ae0cc5f55d2c09858b	2026-06-29 18:04:17.010098+05:30	20260629123416_init	\N	\N	2026-06-29 18:04:16.53547+05:30	1
f8baca4c-bfac-40ce-aac7-5a465d6ea4d5	f35cd77c112980a526acd8d64d74c0430046370d5eae1747e24bded019311b47	2026-06-30 13:30:01.568259+05:30	20260630080001_add_auth_security_fields	\N	\N	2026-06-30 13:30:01.367242+05:30	1
afe51b45-1bce-44d9-ba5e-08ec8c7af921	ea829cb5fbd6633c8a3688476a158e8775207579a0988e318ad9a1ad33a6f675	2026-06-30 13:39:32.856794+05:30	20260630080932_add_last_failed_login_at	\N	\N	2026-06-30 13:39:32.849362+05:30	1
804722f1-5c81-4370-b77e-dab71ff84ec5	2886dc89d8680ea54b6e2a7cd2da8c10697b08d6a93f1965b379609d1b9ab247	2026-06-30 16:50:35.32997+05:30	20260630112035_add_sms_2fa_support	\N	\N	2026-06-30 16:50:35.306557+05:30	1
7a79a7cf-2a8e-42f5-92a4-c9c9ddbbcf84	0c232b40f0a017376ffd6a76b1529301a1fb265e7f71d9233ab3cf6991131509	2026-07-07 16:09:56.075426+05:30	20260707103955_add_site_settings	\N	\N	2026-07-07 16:09:55.959039+05:30	1
9fb70274-4724-4d4c-8dce-e81efc9ea903	5ec20f5d4e6e68d716b4332ecd1b9ca658e5403d4a26d70c7be1906dcafe4b26	2026-07-07 17:02:29.1874+05:30	20260707113229_add_listing_featured_action_type	\N	\N	2026-07-07 17:02:29.179753+05:30	1
66ae40c1-dffc-4846-ade7-4def2e8f334e	87ef605b7f528c5add3bc56a4a5346911a127358b78efdda0b389bd2167d303e	2026-07-08 20:55:55.054206+05:30	20260708152554_add_user_default_parcel_size	\N	\N	2026-07-08 20:55:55.005299+05:30	1
\.


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log (id, admin_id, action_type, target_type, target_id, previous_value, new_value, reason, internal_note, created_at) FROM stdin;
9165fabb-3479-4ba7-bfa5-5f10395deae5	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	a6910ea0-b215-4eda-bdba-e9a2a1827de4	{"name": "Cricket", "status": "active"}	{"name": "Cricket", "slug": "cricket", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783337976/kit-loop/listings/photos/zlz3gpho0ezybvivdlo2.jpg"}	\N	\N	2026-07-06 11:39:42.099
89744deb-38e2-413a-b1ee-8a18f5675787	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	a6910ea0-b215-4eda-bdba-e9a2a1827de4	{"name": "Cricket", "status": "active"}	{"name": "Cricket", "slug": "cricket", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783338004/kit-loop/listings/photos/absdfbb2sd3eezxsva9x.jpg"}	\N	\N	2026-07-06 11:40:10.294
6397b478-c344-43d5-9d97-4b094c3b43df	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	a6910ea0-b215-4eda-bdba-e9a2a1827de4	{"name": "Cricket", "status": "active"}	{"name": "Cricket", "slug": "cricket", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783338156/kit-loop/listings/photos/z9g7py3gcxa6d88nvgn4.jpg"}	\N	\N	2026-07-06 11:42:53.352
caf1eb07-b6a6-4e36-baf2-6f1a11c884fc	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	322ea332-632a-4090-8490-e37ce8a75313	{"name": "Football", "status": "active"}	{"name": "Football", "slug": "football", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783338268/kit-loop/listings/photos/a3i6pec6tmgqqryqwqrt.jpg"}	\N	\N	2026-07-06 11:44:46.577
2c9a506f-9c1e-4920-963a-0389fc74ff74	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	322ea332-632a-4090-8490-e37ce8a75313	{"name": "Football", "status": "active"}	{"name": "Football", "slug": "football", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783338446/kit-loop/listings/photos/rctbpyuoafpculubwyui.jpg"}	\N	\N	2026-07-06 11:47:46.011
3ab22fc9-0640-4c25-a228-ca7a4adeae33	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	322ea332-632a-4090-8490-e37ce8a75313	{"name": "Football", "status": "active"}	{"name": "Football", "slug": "football", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783338559/kit-loop/listings/photos/i0hnxb1liphqrmjinpsu.jpg"}	\N	\N	2026-07-06 11:49:22.541
1481b2fc-d794-46d9-ac95-56fb89f5d2c7	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	322ea332-632a-4090-8490-e37ce8a75313	{"name": "Football", "status": "active"}	{"name": "Football", "slug": "football", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783339364/kit-loop/listings/photos/tegssc7hkeysijsltdyk.png", "sportTag": "team"}	\N	\N	2026-07-06 12:08:51.703
98b1ffcf-7e4a-464c-b8e7-242f2d791d7a	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	a6910ea0-b215-4eda-bdba-e9a2a1827de4	{"name": "Cricket", "status": "active"}	{"name": "Cricket", "slug": "cricket", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783341356/kit-loop/listings/photos/d2qsdp5p0l5wukfclvqj.jpg"}	\N	\N	2026-07-06 12:35:58.445
9ac0144d-f687-4850-a7c7-107361cd06ab	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	32f0204a-3178-4e18-9404-0d2eeea77a77	{"name": "Golf", "status": "active"}	{"name": "Golf", "slug": "golf", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783341408/kit-loop/listings/photos/ts26i0bnijej9swyocnw.jpg"}	\N	\N	2026-07-06 12:36:51.999
ec33270a-2e26-40a6-b24a-87e95b40372c	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	32f0204a-3178-4e18-9404-0d2eeea77a77	{"name": "Golf", "status": "active"}	{"name": "Golf", "slug": "golf", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783341448/kit-loop/listings/photos/j2x77gqur0c6zd13qaux.jpg"}	\N	\N	2026-07-06 12:37:37.611
51705fb5-4a63-4b6e-9e84-33b90972e2cb	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	c4f15d98-401e-4020-b136-b0148a820978	{"name": "Boxing & MMA", "status": "active"}	{"name": "Boxing & MMA", "slug": "boxing-mma", "status": "hidden", "iconUrl": "https://assets.kitloop.com/sports/boxing-and-mma.svg"}	\N	\N	2026-07-06 12:53:58.346
691fa9eb-0207-42fd-8a7b-4871ca609ca9	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	37a51d15-a650-439c-991d-26f4c9bcf296	{"name": "Padel", "status": "active"}	{"name": "Padel", "slug": "padel", "status": "hidden", "iconUrl": "https://assets.kitloop.com/sports/padel.svg"}	\N	\N	2026-07-06 12:57:17.48
2854ce04-a621-4922-b0d8-aa09df83ce38	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	e4c80b3c-0d2c-44c7-b6c7-cbff417137e1	{"name": "Squash", "status": "active"}	{"name": "Squash", "slug": "squash", "status": "hidden", "iconUrl": "https://assets.kitloop.com/sports/squash.svg"}	\N	\N	2026-07-06 12:57:25.833
f8a1a634-5a9e-453d-9ebc-76919ad11ce1	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	ae4d3a1d-ead1-4558-9aaf-18c3de5952d2	{"name": "Ice Hockey", "status": "active"}	{"name": "Ice Hockey", "slug": "ice-hockey", "status": "hidden", "iconUrl": "https://assets.kitloop.com/sports/ice-hockey.svg"}	\N	\N	2026-07-06 12:57:46.762
5908e7e0-bb53-4cb7-a4df-a74608cbdcab	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	c7bc85fd-9db3-4556-b348-6eacbb157a56	{"name": "Netball", "status": "active"}	{"name": "Netball", "slug": "netball", "status": "hidden", "iconUrl": "https://assets.kitloop.com/sports/netball.svg"}	\N	\N	2026-07-06 12:58:08.99
2413d718-9282-451f-8ea3-64760ed4404d	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	f709b1fc-2781-48ff-939d-580689ffaec9	{"name": "Tennis", "status": "active"}	{"name": "Tennis", "slug": "tennis", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783342711/kit-loop/listings/photos/mx19amjtv0gfjmxhrwkv.jpg"}	\N	\N	2026-07-06 12:58:35.128
d503c62e-b88a-4f3d-838a-b99ed302bf9a	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	f3564474-bfe8-46b7-be46-69cf968406fa	{"name": "Running", "status": "active"}	{"name": "Running", "slug": "running", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783342831/kit-loop/listings/photos/cabkod0qqzneurfbzlxf.jpg", "sportTag": "endurance"}	\N	\N	2026-07-06 13:00:40.398
35f20f89-be7c-413b-9079-7ccacf616c39	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	d1fb5816-7587-439a-9597-c3af53fba403	{"name": "Skiing", "status": "active"}	{"name": "Skiing", "slug": "skiing", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783342853/kit-loop/listings/photos/acqomvch7zm4qqy9nnof.jpg", "sportTag": "snow"}	\N	\N	2026-07-06 13:00:59.348
29b001f6-6983-400a-b141-90e99a726503	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	22cc1b43-16d9-4a1a-af14-2aa5fbe30cb9	{"name": "American Football", "status": "active"}	{"name": "American Football", "slug": "american-football", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783342870/kit-loop/listings/photos/kwxk05zglsyfh7epmgxm.jpg", "sportTag": "team"}	\N	\N	2026-07-06 13:01:17.957
bca35df3-86ad-48c1-850f-ad2a538899fc	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	baf3ad38-48c9-4ff7-96dc-ebd0a995fa2e	{"name": "Cycling", "status": "active"}	{"name": "Cycling", "slug": "cycling", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783342968/kit-loop/listings/photos/qkjcrslomv8c2ok1p8sz.jpg", "sportTag": "endurance"}	\N	\N	2026-07-06 13:02:52.25
4c1d1774-d1f0-4a07-8eb8-32f1e4e4163e	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	b9cbd9fd-c00d-4c0b-8fc0-1484bd645613	{"name": "Swimming", "status": "active"}	{"name": "Swimming", "slug": "swimming", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783342989/kit-loop/listings/photos/hbljntnxmfyfm4aigjja.jpg", "sportTag": "water"}	\N	\N	2026-07-06 13:03:16.206
732030f6-c270-44c1-9aaf-30a6198eb520	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	1be57f95-46ff-41af-a72b-c2969907432b	{"name": "Rugby", "status": "active"}	{"name": "Rugby", "slug": "rugby", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783343085/kit-loop/listings/photos/mohanibda7a9m7uksfve.jpg", "sportTag": "team"}	\N	\N	2026-07-06 13:04:50.72
b445abad-43a9-4f6c-85c6-80feab3e2b71	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	96e0f7bc-447e-4524-94cf-1f05250a1271	{"name": "Badminton", "status": "active"}	{"name": "Badminton", "slug": "badminton", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783343103/kit-loop/listings/photos/o2in7voyhwupzmspjpsl.jpg", "sportTag": "racket"}	\N	\N	2026-07-06 13:05:08.51
d7c87f88-133b-4443-9581-43a2e0711566	3848d9ae-cf93-4532-a774-541752473dc4	category_edited	sport	5713ff8b-942d-48bd-ac82-7542f366b25b	{"name": "Basketball", "status": "active"}	{"name": "Basketball", "slug": "basketball", "status": "active", "iconUrl": "https://res.cloudinary.com/re7qlgis/image/upload/v1783343179/kit-loop/listings/photos/smsjuw90dbpk7cbpes3u.jpg", "sportTag": "team"}	\N	\N	2026-07-06 13:06:25.229
cc350950-a801-420b-9042-dd96c5e70134	3848d9ae-cf93-4532-a774-541752473dc4	site_setting_updated	site_setting	4a1f3a10-c394-44fa-b141-bef7f456dd12	{"value": null}	{"value": "https://res.cloudinary.com/demo/image/upload/sample.jpg"}	\N	\N	2026-07-07 11:09:40.497
51383528-74dd-408c-b28f-11f8947d4f12	3848d9ae-cf93-4532-a774-541752473dc4	site_setting_updated	site_setting	4a1f3a10-c394-44fa-b141-bef7f456dd12	{"value": "https://res.cloudinary.com/demo/image/upload/sample.jpg"}	{"value": null}	\N	\N	2026-07-07 11:09:40.722
3baff5ef-e2fe-4f04-a10b-cf2c9e920623	3848d9ae-cf93-4532-a774-541752473dc4	site_setting_updated	site_setting	4a1f3a10-c394-44fa-b141-bef7f456dd12	{"value": null}	{"value": "https://res.cloudinary.com/re7qlgis/image/upload/v1783425668/kit-loop/listings/photos/ro9oonjpcm3zgovmgoo4.jpg"}	\N	\N	2026-07-07 12:01:09.067
af17581f-dd9a-4b6f-ab20-d4b534a60731	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	5e8eb547-b9e6-4e0e-91c8-bc5b9e57cff8	{"isFeatured": false}	{"isFeatured": true}	\N	\N	2026-07-07 12:15:59.884
25ad20a7-224f-429e-8c22-628392a45069	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	8fe71aa0-1129-499b-b849-0669a731155d	{"isFeatured": false}	{"isFeatured": true}	\N	\N	2026-07-07 12:16:02.023
e7cf309b-79a6-41c8-85b5-0a9dc7dc76bc	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	bf60d4c1-73be-4924-ba37-6f8974decc33	{"isFeatured": false}	{"isFeatured": true}	\N	\N	2026-07-07 12:16:03.835
f61afd35-9ec7-4ce0-bb44-eea63dfc207f	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	3ba9d981-f8f2-4880-a622-bfdda5d87ee1	{"isFeatured": false}	{"isFeatured": true}	\N	\N	2026-07-07 12:16:05.26
892bed9f-1e3a-4229-85b1-a05a52f9e6d0	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	e1c16426-cafc-4a2b-8fa4-fc4b4917b29b	{"isFeatured": false}	{"isFeatured": true}	\N	\N	2026-07-07 12:16:06.697
55dfda1d-d969-4ecd-9cd5-1d98dc18acc8	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	e1c16426-cafc-4a2b-8fa4-fc4b4917b29b	{"isFeatured": true}	{"isFeatured": false}	\N	\N	2026-07-07 12:37:10.919
552b2a33-ff99-479b-b53b-8c7a622059ff	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	3ba9d981-f8f2-4880-a622-bfdda5d87ee1	{"isFeatured": true}	{"isFeatured": false}	\N	\N	2026-07-07 12:37:12.054
529cd9c9-abe6-460e-bbc0-5b0283ff00bd	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	bf60d4c1-73be-4924-ba37-6f8974decc33	{"isFeatured": true}	{"isFeatured": false}	\N	\N	2026-07-07 12:37:13.384
db0f85a6-e7a8-4b08-9956-6c1882f653cf	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	8fe71aa0-1129-499b-b849-0669a731155d	{"isFeatured": true}	{"isFeatured": false}	\N	\N	2026-07-07 12:37:14.903
63471389-0b2a-4141-a363-14dc2efbefcc	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	5e8eb547-b9e6-4e0e-91c8-bc5b9e57cff8	{"isFeatured": true}	{"isFeatured": false}	\N	\N	2026-07-07 12:37:16.425
f6e8f7a3-ced8-4f80-997e-1454a316ffd3	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	1575607a-7e2a-49a5-8b86-6cdb84ec7bc8	{"isFeatured": false}	{"isFeatured": true}	\N	\N	2026-07-07 12:37:19.752
0e34cca9-1723-45fe-ac35-bed429692f21	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	d1f5932e-e26e-4194-8ea9-a4dd7b061707	{"isFeatured": false}	{"isFeatured": true}	\N	\N	2026-07-07 12:37:20.879
de2900fa-e8a7-42d5-a628-7f084cea58c6	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	94f4756c-cff6-4019-b13e-0c8525b38c76	{"isFeatured": false}	{"isFeatured": true}	\N	\N	2026-07-07 12:37:22.068
89113edc-ba6a-4137-9784-247b26d19be3	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	686a8c29-243d-4093-aa09-1f7d0ecb68c1	{"isFeatured": false}	{"isFeatured": true}	\N	\N	2026-07-08 06:48:16.277
09b6da69-2af3-4ff3-a59d-bdcfbcbfd70c	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	c8777bb9-18db-4462-9639-c9299ea87cab	{"isFeatured": false}	{"isFeatured": true}	\N	\N	2026-07-08 06:48:17.407
15f7f712-faee-4cad-8621-8b7ad5e53bd8	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	4b6d9030-70e0-4efb-b211-6db1793f6a37	{"isFeatured": false}	{"isFeatured": true}	\N	\N	2026-07-08 06:48:18.664
524bc4b9-7c1d-41f5-b1c1-b599f79e2e48	3848d9ae-cf93-4532-a774-541752473dc4	listing_featured	listing	faa437bf-b972-4456-8271-e74b6cd90328	{"isFeatured": false}	{"isFeatured": true}	\N	\N	2026-07-08 08:10:06.825
613ad89c-3be4-463e-8b53-662f1767d91a	3848d9ae-cf93-4532-a774-541752473dc4	fee_updated	fee_config	033f8acd-f6db-4a33-9985-9a7e9aef321a	{"configValue": "0.05"}	{"configValue": 12}	\N	\N	2026-07-08 15:04:56.864
7e444065-0a47-4a19-b491-7efd69c848d0	3848d9ae-cf93-4532-a774-541752473dc4	fee_updated	fee_config	033f8acd-f6db-4a33-9985-9a7e9aef321a	{"configValue": "12"}	{"configValue": 2}	\N	\N	2026-07-08 15:10:15.291
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brands (id, name, slug, logo_url, status, display_order, created_at, updated_at) FROM stdin;
3682f666-c17a-4f19-8532-8e4073b34c4b	Nike	nike	https://assets.kitloop.com/brands/nike.svg	active	1	2026-06-30 12:51:58.575	2026-07-06 05:14:09.998
10e1194f-61f1-48c8-964a-30bb264226c8	Adidas	adidas	https://assets.kitloop.com/brands/adidas.svg	active	2	2026-06-30 12:51:58.583	2026-07-06 05:14:10
4500f216-e0e9-4025-bd0e-0f582c225d5a	Puma	puma	https://assets.kitloop.com/brands/puma.svg	active	3	2026-06-30 12:51:58.585	2026-07-06 05:14:10.002
a2d57476-8c3b-4acb-a9e0-9f7961b80416	Callaway	callaway	https://assets.kitloop.com/brands/callaway.svg	active	10	2026-06-30 12:51:58.598	2026-07-06 05:14:10.01
abf4220f-0ab8-4f41-bc23-e85705bbe27d	TaylorMade	taylormade	https://assets.kitloop.com/brands/taylormade.svg	active	11	2026-06-30 12:51:58.6	2026-07-06 05:14:10.012
00da97ba-e336-4b4a-84f2-eef4f6e55ce0	Titleist	titleist	https://assets.kitloop.com/brands/titleist.svg	active	12	2026-06-30 12:51:58.602	2026-07-06 05:14:10.013
77215d8e-f730-4727-a778-2527f5adc322	Ping	ping	https://assets.kitloop.com/brands/ping.svg	active	13	2026-06-30 12:51:58.604	2026-07-06 05:14:10.015
e58f188c-c7d6-4ae9-b067-c98c773db675	Wilson	wilson	https://assets.kitloop.com/brands/wilson.svg	active	14	2026-06-30 12:51:58.606	2026-07-06 05:14:10.016
bef647b5-a92e-48f4-9f98-cb7e3ffb58eb	Babolat	babolat	https://assets.kitloop.com/brands/babolat.svg	active	15	2026-06-30 12:51:58.607	2026-07-06 05:14:10.017
65416737-9889-4e79-afc3-36ab3c8f5947	Head	head	https://assets.kitloop.com/brands/head.svg	active	16	2026-06-30 12:51:58.609	2026-07-06 05:14:10.018
071b3032-aa7a-4307-993f-adcfa6403bba	Yonex	yonex	https://assets.kitloop.com/brands/yonex.svg	active	17	2026-06-30 12:51:58.611	2026-07-06 05:14:10.02
b65c10bc-3505-4fd4-9870-1db8d7fb8e0b	Salomon	salomon	https://assets.kitloop.com/brands/salomon.svg	active	18	2026-06-30 12:51:58.612	2026-07-06 05:14:10.021
b5db0b6a-92aa-418f-8314-a27d9fbd7f73	Atomic	atomic	https://assets.kitloop.com/brands/atomic.svg	active	19	2026-06-30 12:51:58.614	2026-07-06 05:14:10.022
02ef7434-d2a5-413f-b359-1ea90819ebef	Rossignol	rossignol	https://assets.kitloop.com/brands/rossignol.svg	active	20	2026-06-30 12:51:58.616	2026-07-06 05:14:10.024
7f377356-a99d-4877-8c48-858ee87cc2bd	Trek	trek	https://assets.kitloop.com/brands/trek.svg	active	21	2026-06-30 12:51:58.617	2026-07-06 05:14:10.025
1d673323-43e8-4ec3-9e7e-c1954c075ca3	Specialized	specialized	https://assets.kitloop.com/brands/specialized.svg	active	22	2026-06-30 12:51:58.619	2026-07-06 05:14:10.027
e3f1c3ea-e941-491e-8c1d-53f73736815b	Giant	giant	https://assets.kitloop.com/brands/giant.svg	active	23	2026-06-30 12:51:58.621	2026-07-06 05:14:10.029
d1554581-e11b-4c26-a28d-72c3afa286ac	Speedo	speedo	https://assets.kitloop.com/brands/speedo.svg	active	24	2026-06-30 12:51:58.622	2026-07-06 05:14:10.031
17a9b9f5-71ad-48c6-a73b-6872acc86a24	Arena	arena	https://assets.kitloop.com/brands/arena.svg	active	25	2026-06-30 12:51:58.624	2026-07-06 05:14:10.032
647dfca6-3833-4aa9-9af3-fbb948d2f993	Everlast	everlast	https://assets.kitloop.com/brands/everlast.svg	active	26	2026-06-30 12:51:58.626	2026-07-06 05:14:10.033
b9350037-2d92-43d7-ab2a-1b5f25bbde5a	Venum	venum	https://assets.kitloop.com/brands/venum.svg	active	27	2026-06-30 12:51:58.627	2026-07-06 05:14:10.034
b347b079-5a62-41a6-8d0b-f036347e04ac	Bauer	bauer	https://assets.kitloop.com/brands/bauer.svg	active	28	2026-06-30 12:51:58.629	2026-07-06 05:14:10.036
ee05d5aa-3784-4dd1-ad58-57c7840b2105	CCM	ccm	https://assets.kitloop.com/brands/ccm.svg	active	29	2026-06-30 12:51:58.63	2026-07-06 05:14:10.037
c74a57ca-e35d-4da7-81df-e068002d7873	Canterbury	canterbury	https://assets.kitloop.com/brands/canterbury.svg	active	30	2026-06-30 12:51:58.631	2026-07-06 05:14:10.039
d0a65c82-76b1-47c1-a035-160e76be5771	Gilbert	gilbert	https://assets.kitloop.com/brands/gilbert.svg	active	31	2026-06-30 12:51:58.633	2026-07-06 05:14:10.041
b3e80a9c-302b-40cb-8a6b-678f542832bd	Under Armour	under-armour	https://assets.kitloop.com/brands/under-armour.svg	active	4	2026-06-30 12:51:58.587	2026-07-06 05:14:10.003
0d4152d3-aa16-4a1d-8dda-d72b31ed97bc	New Balance	new-balance	https://assets.kitloop.com/brands/new-balance.svg	active	5	2026-06-30 12:51:58.588	2026-07-06 05:14:10.004
f09908e7-2d6a-4d32-949a-c0f59548e1f4	Asics	asics	https://assets.kitloop.com/brands/asics.svg	active	6	2026-06-30 12:51:58.59	2026-07-06 05:14:10.005
80f06a28-63eb-4ec7-bc56-781147a1fe6a	Gray-Nicolls	gray-nicolls	https://assets.kitloop.com/brands/gray-nicolls.svg	active	7	2026-06-30 12:51:58.591	2026-07-06 05:14:10.006
cdfc2c77-df64-4dc6-845e-f91b286e83a0	Gunn & Moore	gunn-and-moore	https://assets.kitloop.com/brands/gunn-and-moore.svg	active	8	2026-06-30 12:51:58.594	2026-07-06 05:14:10.007
7788efc2-bd18-44dd-bf8e-07defcf65eb1	Kookaburra	kookaburra	https://assets.kitloop.com/brands/kookaburra.svg	active	9	2026-06-30 12:51:58.596	2026-07-06 05:14:10.009
\.


--
-- Data for Name: counter_offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.counter_offers (id, offer_id, message_id, seller_id, buyer_id, listing_id, counter_amount, original_price, status, expires_at, accepted_at, declined_at, checkout_price_lock_expires_at, created_at, updated_at) FROM stdin;
42540a82-fe1e-46fd-ba08-1861e191988d	21bcbe73-660f-4e4c-b397-24eb5d7d1133	334b35e7-196a-4a0d-981a-a2b05099174c	b3a05005-de0b-44fb-a34c-e18e76facc70	19ce4223-979d-4c00-9d94-e0c498579e93	e1c16426-cafc-4a2b-8fa4-fc4b4917b29b	42.00	45.00	expired	2026-07-07 06:53:51.956	\N	\N	\N	2026-07-06 06:53:51.968	2026-07-07 12:00:00.164
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disputes (id, order_id, buyer_id, seller_id, reason, description, evidence_photos, seller_response, seller_evidence_photos, seller_responded_at, seller_response_deadline, status, admin_id, ruling, ruling_reason, refund_amount, seller_release_amount, shipping_fee_refunded, additional_evidence_requested, additional_evidence_deadline, resolved_at, created_at, updated_at) FROM stdin;
30ed307f-232c-4efe-a827-8009ada9d117	3624b279-85c9-46e4-a458-4accb193119f	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	item_not_as_described	We received wrong item	[]	we will replace you this product	[]	2026-07-09 13:10:21.395	2026-07-11 12:56:53.056	seller_responded	\N	\N	\N	\N	\N	f	f	\N	\N	2026-07-09 12:56:53.083	2026-07-09 13:10:21.406
\.


--
-- Data for Name: favourites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favourites (id, user_id, listing_id, created_at) FROM stdin;
e278258e-7ea9-41a4-b881-8c707ed932c1	3848d9ae-cf93-4532-a774-541752473dc4	94f4756c-cff6-4019-b13e-0c8525b38c76	2026-07-07 12:17:26.898
\.


--
-- Data for Name: fee_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fee_config (id, config_key, config_value, config_type, description, sport_id, is_promotional, promotional_start, promotional_end, previous_value, updated_by, created_at, updated_at) FROM stdin;
e59cbe6f-6630-4832-b79b-d62e676a78b6	platform_commission_percentage	0.1000	percentage	Platform commission (10 %)	\N	f	\N	\N	\N	\N	2026-07-06 05:11:25.575	2026-07-06 05:11:25.575
033f8acd-f6db-4a33-9985-9a7e9aef321a	buyer_protection_fee_percentage	2.0000	percentage	Buyer protection fee (5 %)	\N	f	\N	\N	12.0000	3848d9ae-cf93-4532-a774-541752473dc4	2026-07-06 05:11:25.554	2026-07-08 15:10:15.272
b2709cef-799d-43b2-b8d3-413ce7fb045b	dispute_window_days	2.0000	flat_amount	Days after delivery buyer can raise a dispute	\N	f	\N	\N	3.0000	\N	2026-07-06 05:11:25.585	2026-07-06 05:11:25.585
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listings (id, seller_id, title, description, sport_id, sub_category_id, brand_id, condition, colour, price, parcel_size, shipping_fee, status, flag_reason, removal_reason, photos, video_url, view_count, wishlist_count, share_count, is_featured, featured_at, og_image_url, published_at, sold_at, created_at, updated_at) FROM stdin;
2087fe15-c195-4a92-8e31-a945f7650316	b3a05005-de0b-44fb-a34c-e18e76facc70	[TEST] Gray-Nicolls Kronus Cricket Bat	Excellent condition full-size Gray-Nicolls Kronus bat. Light oiling done, one small knock mark on back. Used for one season club cricket.	a6910ea0-b215-4eda-bdba-e9a2a1827de4	854c866d-9a37-4078-9aed-aa6a12deb228	80f06a28-63eb-4ec7-bc56-781147a1fe6a	like_new	Willow	85.00	large	6.99	sold	\N	\N	["https://res.cloudinary.com/kitloop/image/upload/test/cricket-bat-1.jpg", "https://res.cloudinary.com/kitloop/image/upload/test/cricket-bat-2.jpg"]	\N	0	0	0	f	\N	\N	2026-06-06 06:53:51.859	2026-06-29 06:53:51.859	2026-07-06 06:53:51.867	2026-07-06 06:53:51.867
6ff4f50e-438e-43c0-9db4-52fa844fc735	b3a05005-de0b-44fb-a34c-e18e76facc70	Tennis Racket and ball	A used tennis recket and ball, 2 years old	f709b1fc-2781-48ff-939d-580689ffaec9	e655e163-f1f8-4878-98aa-eb40f5095fc6	b347b079-5a62-41a6-8d0b-f036347e04ac	good	Grey	65.00	large	8.99	sold	\N	\N	["https://res.cloudinary.com/re7qlgis/image/upload/v1783403651/kit-loop/listings/photos/ptqsltn0iae4qfgdvfun.jpg"]	\N	2	0	0	f	\N	https://res.cloudinary.com/re7qlgis/image/upload/c_fill,w_1200,h_630,g_auto,q_auto,f_auto/v1783403651/kit-loop/listings/photos/ptqsltn0iae4qfgdvfun.jpg	2026-07-07 05:55:20.656	2026-07-07 06:26:48.689	2026-07-07 05:55:20.613	2026-07-07 06:26:48.705
fea7e0cb-3357-471b-91e6-bbc209b070bd	b3a05005-de0b-44fb-a34c-e18e76facc70	Cricket Bat Legend	A cricket bat is used by joe root	a6910ea0-b215-4eda-bdba-e9a2a1827de4	854c866d-9a37-4078-9aed-aa6a12deb228	3682f666-c17a-4f19-8532-8e4073b34c4b	good	Yellow	50.00	large	8.99	sold	\N	\N	["https://res.cloudinary.com/re7qlgis/image/upload/v1783324718/kit-loop/listings/photos/ps1gdumpf4rjalnatepq.jpg"]	\N	8	0	0	f	\N	https://res.cloudinary.com/re7qlgis/image/upload/c_fill,w_1200,h_630,g_auto,q_auto,f_auto/v1783324718/kit-loop/listings/photos/ps1gdumpf4rjalnatepq.jpg	2026-07-06 07:59:13.531	2026-07-06 14:01:50.573	2026-07-06 07:59:13.489	2026-07-06 14:01:50.646
6ac59c36-530a-4921-838b-8d7bc4a4c0e4	b3a05005-de0b-44fb-a34c-e18e76facc70	Cricket bat legend	A legend cricket bat used by virat kohly	a6910ea0-b215-4eda-bdba-e9a2a1827de4	854c866d-9a37-4078-9aed-aa6a12deb228	4500f216-e0e9-4025-bd0e-0f582c225d5a	good	Yellow	10.00	large	8.99	sold	\N	\N	["https://res.cloudinary.com/re7qlgis/image/upload/v1783323497/kit-loop/listings/photos/i8tan0cummbg0jzv7n8b.jpg"]	\N	12	0	0	f	\N	https://res.cloudinary.com/re7qlgis/image/upload/c_fill,w_1200,h_630,g_auto,q_auto,f_auto/v1783323497/kit-loop/listings/photos/i8tan0cummbg0jzv7n8b.jpg	2026-07-06 07:39:29.683	2026-07-07 07:54:27.138	2026-07-06 07:39:29.623	2026-07-07 07:54:27.165
e1c16426-cafc-4a2b-8fa4-fc4b4917b29b	b3a05005-de0b-44fb-a34c-e18e76facc70	[TEST] Nike Mercurial Football Boots	Size 9 Nike Mercurial Vapor boots in good condition. Some stud wear but upper is clean. FG studs. Worn for one season.	322ea332-632a-4090-8490-e37ce8a75313	dd748700-9483-429d-ae37-79a68d6b3e87	3682f666-c17a-4f19-8532-8e4073b34c4b	good	Blue/Orange	45.00	medium	4.99	live	\N	\N	["https://res.cloudinary.com/kitloop/image/upload/test/football-boots-1.jpg"]	\N	11	0	0	f	\N	\N	2026-06-22 06:53:51.859	\N	2026-07-06 06:53:51.885	2026-07-08 06:40:13.096
bf60d4c1-73be-4924-ba37-6f8974decc33	b3a05005-de0b-44fb-a34c-e18e76facc70	[TEST] Callaway Rogue Golf Driver	Callaway Rogue 10.5 driver with Aldila Synergy shaft. Fair condition, normal signs of play. Head cover included.	32f0204a-3178-4e18-9404-0d2eeea77a77	2544f6c7-e2b3-42c8-9df2-e72d149c56ae	a2d57476-8c3b-4acb-a9e0-9f7961b80416	fair	Black	95.00	large	7.99	live	\N	\N	["https://res.cloudinary.com/kitloop/image/upload/test/golf-driver-1.jpg"]	\N	12	0	0	f	\N	\N	2026-06-26 06:53:51.859	\N	2026-07-06 06:53:51.894	2026-07-08 06:40:13.119
5e8eb547-b9e6-4e0e-91c8-bc5b9e57cff8	8ba77c5c-e401-4529-8680-67bef9367d81	[TEST] Yonex Astrox 99 Badminton Racket	Excellent condition Yonex Astrox 99 in 3U/G5. Strung with BG65 at 24lbs. Light scratches on frame from play but shaft is perfect. Bag included.	96e0f7bc-447e-4524-94cf-1f05250a1271	fc99d825-81a2-489e-b547-198fffdd2f40	071b3032-aa7a-4307-993f-adcfa6403bba	like_new	Red/Black	95.00	large	4.99	live	\N	\N	["https://res.cloudinary.com/kitloop/image/upload/test/badminton-racket-1.jpg"]	\N	10	0	0	f	\N	\N	2026-06-28 06:53:51.983	\N	2026-07-06 06:53:51.984	2026-07-08 06:40:13.163
3ba9d981-f8f2-4880-a622-bfdda5d87ee1	b3a05005-de0b-44fb-a34c-e18e76facc70	[TEST] Babolat Pure Drive Tennis Racket	Brand new, still in original packaging. Received as a gift but already have a racket. 300g, 4 3/8 grip. Unstrung.	f709b1fc-2781-48ff-939d-580689ffaec9	e655e163-f1f8-4878-98aa-eb40f5095fc6	bef647b5-a92e-48f4-9f98-cb7e3ffb58eb	new_with_tags	Blue	120.00	large	5.99	sold	\N	\N	["https://res.cloudinary.com/kitloop/image/upload/test/tennis-racket-1.jpg", "https://res.cloudinary.com/kitloop/image/upload/test/tennis-racket-2.jpg", "https://res.cloudinary.com/kitloop/image/upload/test/tennis-racket-3.jpg"]	\N	11	0	0	f	\N	\N	2026-07-01 06:53:51.859	2026-07-08 08:06:12.574	2026-07-06 06:53:51.89	2026-07-08 08:06:12.592
8fe71aa0-1129-499b-b849-0669a731155d	b3a05005-de0b-44fb-a34c-e18e76facc70	[TEST] New Balance Fresh Foam Running Shoes	Lightly used NB Fresh Foam 1080 in UK 10. Only done around 50 miles. Minimal wear on outsole. Great cushioning.	f3564474-bfe8-46b7-be46-69cf968406fa	0e56e53b-218d-4df1-b80c-abc1c7fe0492	0d4152d3-aa16-4a1d-8dda-d72b31ed97bc	like_new	White/Black	65.00	medium	4.99	sold	\N	\N	["https://res.cloudinary.com/kitloop/image/upload/test/running-shoes-1.jpg", "https://res.cloudinary.com/kitloop/image/upload/test/running-shoes-2.jpg"]	\N	10	0	0	f	\N	\N	2026-07-03 06:53:51.859	2026-07-08 06:50:11.722	2026-07-06 06:53:51.9	2026-07-08 06:50:11.739
94f4756c-cff6-4019-b13e-0c8525b38c76	b3a05005-de0b-44fb-a34c-e18e76facc70	Football - white & black	A white and black football standard size is available , used for 6 months	322ea332-632a-4090-8490-e37ce8a75313	abafbce5-8062-491e-af66-36065cf44214	10e1194f-61f1-48c8-964a-30bb264226c8	good	White	10.00	medium	5.49	live	\N	\N	["https://res.cloudinary.com/re7qlgis/image/upload/v1783425783/kit-loop/listings/photos/fvkybg6jepjjpqi3sx6l.jpg", "https://res.cloudinary.com/re7qlgis/image/upload/v1783425940/kit-loop/listings/photos/dxaxbfe07ytyeoheigjv.jpg", "https://res.cloudinary.com/re7qlgis/image/upload/v1783425950/kit-loop/listings/photos/yy4x71adnop9d39z5lce.jpg"]	\N	4	1	0	t	2026-07-07 12:37:22.062	https://res.cloudinary.com/re7qlgis/image/upload/c_fill,w_1200,h_630,g_auto,q_auto,f_auto/v1783425783/kit-loop/listings/photos/fvkybg6jepjjpqi3sx6l.jpg	2026-07-07 12:06:19.105	\N	2026-07-07 12:06:19.066	2026-07-09 08:06:09.92
1575607a-7e2a-49a5-8b86-6cdb84ec7bc8	b3a05005-de0b-44fb-a34c-e18e76facc70	Tennis ball in good condition	A tennis ball is a hollow rubber sphere covered in fibrous felt, precision-engineered to meet strict universal regulations for professional and recreational play.	f709b1fc-2781-48ff-939d-580689ffaec9	5693ba11-78df-4d07-9109-4bbfa896661a	4500f216-e0e9-4025-bd0e-0f582c225d5a	good	Green	34.00	small	3.49	live	\N	\N	["https://res.cloudinary.com/re7qlgis/image/upload/v1783427052/kit-loop/listings/photos/pjpfial0smaigppg9dsv.jpg", "https://res.cloudinary.com/re7qlgis/image/upload/v1783427061/kit-loop/listings/photos/qceqxygkh8hw3nzorkpo.jpg", "https://res.cloudinary.com/re7qlgis/image/upload/v1783427070/kit-loop/listings/photos/shtwms4rzhgytmwo82r1.jpg"]	\N	5	0	0	t	2026-07-07 12:37:19.742	https://res.cloudinary.com/re7qlgis/image/upload/c_fill,w_1200,h_630,g_auto,q_auto,f_auto/v1783427052/kit-loop/listings/photos/pjpfial0smaigppg9dsv.jpg	2026-07-07 12:25:28.654	\N	2026-07-07 12:25:28.598	2026-07-10 07:14:59.964
4b6d9030-70e0-4efb-b211-6db1793f6a37	b3a05005-de0b-44fb-a34c-e18e76facc70	Badminton racket - 6 month used	Badminton is the world's fastest racquet sport, played by either two opposing players (singles) or two pairs (doubles) who use lightweight racquets to hit a shuttlecock over a net.	96e0f7bc-447e-4524-94cf-1f05250a1271	fc99d825-81a2-489e-b547-198fffdd2f40	071b3032-aa7a-4307-993f-adcfa6403bba	good	Teal	20.00	medium	5.49	live	\N	\N	["https://res.cloudinary.com/re7qlgis/image/upload/v1783492653/kit-loop/listings/photos/d6njgx2iutklzrgfwqxm.jpg", "https://res.cloudinary.com/re7qlgis/image/upload/v1783492696/kit-loop/listings/photos/txz2ixxhufsa5wy2srzj.jpg", "https://res.cloudinary.com/re7qlgis/image/upload/v1783492701/kit-loop/listings/photos/lrkfnvo0mamyv5jwwksn.jpg"]	\N	3	0	0	t	2026-07-08 06:48:18.658	https://res.cloudinary.com/re7qlgis/image/upload/c_fill,w_1200,h_630,g_auto,q_auto,f_auto/v1783492653/kit-loop/listings/photos/d6njgx2iutklzrgfwqxm.jpg	2026-07-08 06:39:56.587	\N	2026-07-08 06:39:56.507	2026-07-09 11:51:09.856
686a8c29-243d-4093-aa09-1f7d0ecb68c1	b3a05005-de0b-44fb-a34c-e18e76facc70	Cycling  Helmet - Black	Enlarged and widened cycling helmet, suitable for mountain and road biking. Lightweight and ventilated, adjustable design with removable padding.	baf3ad38-48c9-4ff7-96dc-ebd0a995fa2e	d1a35c6f-b55b-4dab-8bc7-e68828b21045	b65c10bc-3505-4fd4-9870-1db8d7fb8e0b	good	Black	34.00	small	3.49	live	\N	\N	["https://res.cloudinary.com/re7qlgis/image/upload/v1783493072/kit-loop/listings/photos/nabkh9twhey9mlmpacsl.jpg", "https://res.cloudinary.com/re7qlgis/image/upload/v1783493077/kit-loop/listings/photos/nfbpwh6inbv1fculqhsr.jpg"]	\N	1	0	0	t	2026-07-08 06:48:16.254	https://res.cloudinary.com/re7qlgis/image/upload/c_fill,w_1200,h_630,g_auto,q_auto,f_auto/v1783493072/kit-loop/listings/photos/nabkh9twhey9mlmpacsl.jpg	2026-07-08 06:45:43.866	\N	2026-07-08 06:45:43.831	2026-07-08 06:48:16.266
c8777bb9-18db-4462-9639-c9299ea87cab	b3a05005-de0b-44fb-a34c-e18e76facc70	Front Rack Light - Cycling	Quality PP material bike front light rack. Suitable size, easy install, wide application for most bicycles including mountain bikes and road bikes.	baf3ad38-48c9-4ff7-96dc-ebd0a995fa2e	5fb3f2ed-ab5f-4ccd-a615-8555c6ef8cdd	f09908e7-2d6a-4d32-949a-c0f59548e1f4	good	Black	50.00	small	3.49	live	\N	\N	["https://res.cloudinary.com/re7qlgis/image/upload/v1783492953/kit-loop/listings/photos/y2q8xxjritokp7jzwxdf.jpg", "https://res.cloudinary.com/re7qlgis/image/upload/v1783492966/kit-loop/listings/photos/masaoufsvjgnhhodynqv.jpg"]	\N	1	0	0	t	2026-07-08 06:48:17.39	https://res.cloudinary.com/re7qlgis/image/upload/c_fill,w_1200,h_630,g_auto,q_auto,f_auto/v1783492953/kit-loop/listings/photos/y2q8xxjritokp7jzwxdf.jpg	2026-07-08 06:44:23.294	\N	2026-07-08 06:44:23.224	2026-07-08 06:48:17.39
d1f5932e-e26e-4194-8ea9-a4dd7b061707	b3a05005-de0b-44fb-a34c-e18e76facc70	Cricket bat with grip	Choosing the right cricket bat depends on your playing style, budget, and the type of ball you use. English Willow bats are light and offer a premium feel.	a6910ea0-b215-4eda-bdba-e9a2a1827de4	854c866d-9a37-4078-9aed-aa6a12deb228	4500f216-e0e9-4025-bd0e-0f582c225d5a	good	Yellow	50.00	large	8.99	live	\N	\N	["https://res.cloudinary.com/re7qlgis/image/upload/v1783426009/kit-loop/listings/photos/m9gpravdmbtgy1svxgff.jpg", "https://res.cloudinary.com/re7qlgis/image/upload/v1783426108/kit-loop/listings/photos/mi5jujbtileaosrphak6.jpg", "https://res.cloudinary.com/re7qlgis/image/upload/v1783426118/kit-loop/listings/photos/dwpjyxenxqyuljuxinkn.jpg"]	\N	9	0	0	t	2026-07-07 12:37:20.872	https://res.cloudinary.com/re7qlgis/image/upload/c_fill,w_1200,h_630,g_auto,q_auto,f_auto/v1783426009/kit-loop/listings/photos/m9gpravdmbtgy1svxgff.jpg	2026-07-07 12:09:40.534	\N	2026-07-07 12:09:40.496	2026-07-13 12:49:47.197
faa437bf-b972-4456-8271-e74b6cd90328	b3a05005-de0b-44fb-a34c-e18e76facc70	Badminton Racket - Used 6 months	Example description text for a used badminton racket in fair condition.	96e0f7bc-447e-4524-94cf-1f05250a1271	fc99d825-81a2-489e-b547-198fffdd2f40	4500f216-e0e9-4025-bd0e-0f582c225d5a	fair	Navy	32.00	medium	5.49	live	\N	\N	["https://res.cloudinary.com/re7qlgis/image/upload/v1783498046/kit-loop/listings/photos/l2ao1alfzz5ows6zuejm.jpg"]	\N	8	0	0	t	2026-07-08 08:10:06.816	https://res.cloudinary.com/re7qlgis/image/upload/c_fill,w_1200,h_630,g_auto,q_auto,f_auto/v1783498046/kit-loop/listings/photos/l2ao1alfzz5ows6zuejm.jpg	2026-07-08 08:08:50.338	\N	2026-07-08 08:08:50.155	2026-07-13 12:36:49.803
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, offer_id, sender_id, message_type, body, offer_amount, is_read, is_blocked, block_reason, created_at) FROM stdin;
1ec940e1-d0d2-40a1-8203-1d92ad6b46a4	21bcbe73-660f-4e4c-b397-24eb5d7d1133	19ce4223-979d-4c00-9d94-e0c498579e93	offer	Hi! I'm interested in the boots. Would you accept 38?	38.00	t	f	\N	2026-07-06 06:53:51.96
334b35e7-196a-4a0d-981a-a2b05099174c	21bcbe73-660f-4e4c-b397-24eb5d7d1133	b3a05005-de0b-44fb-a34c-e18e76facc70	counter_offer	Thanks for the interest! Best I can do is 42, they're in great nick.	42.00	f	f	\N	2026-07-06 06:53:51.964
0986b5ca-4751-4f48-91bd-ea7229a7a467	21bcbe73-660f-4e4c-b397-24eb5d7d1133	19ce4223-979d-4c00-9d94-e0c498579e93	text	i can do at 38	\N	f	f	\N	2026-07-06 08:00:26.581
19521401-d3c7-4fb2-b3c4-41b49aafa0da	27dd4f8b-1412-4cd6-9a04-8c11c6e736b9	19ce4223-979d-4c00-9d94-e0c498579e93	text	i want to have it a 60	\N	f	f	\N	2026-07-07 05:56:18.247
5b73a740-945d-48ec-822e-55864acf05af	759c7e25-c6ee-4b57-989f-e0d3fffa0c7a	19ce4223-979d-4c00-9d94-e0c498579e93	offer	My offer	30.00	f	f	\N	2026-07-07 12:27:06.201
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, body, reference_id, reference_type, is_read, sent_in_app, sent_email, created_at) FROM stdin;
f482ab9a-2c3b-4c15-af1f-52d97044f724	19ce4223-979d-4c00-9d94-e0c498579e93	order_placed	Order confirmed	Your order for "Cricket Bat Legend" is confirmed. The seller will dispatch soon.	3624b279-85c9-46e4-a458-4accb193119f	order	f	f	f	2026-07-06 14:01:50.752
fe4e4ae3-6ab1-49dc-aba8-71be2afaa766	b3a05005-de0b-44fb-a34c-e18e76facc70	order_placed	New sale!	You've sold "Cricket Bat Legend". Please dispatch within 3 days.	3624b279-85c9-46e4-a458-4accb193119f	order	t	f	f	2026-07-06 14:01:50.752
6f66439e-9fbd-4e23-a903-8aad7ee746f1	da804619-9850-49d6-a79f-9ddc7ccd6b96	order_placed	Order confirmed	Your order for "Tennis Racket and ball" is confirmed. The seller will dispatch soon.	5f2181c4-aca1-4736-bf20-e4231690f35c	order	f	f	f	2026-07-07 06:26:48.774
dcc8728c-896c-4fd0-a8bd-801fcd663465	b3a05005-de0b-44fb-a34c-e18e76facc70	order_placed	New sale!	You've sold "Tennis Racket and ball". Please dispatch within 3 days.	5f2181c4-aca1-4736-bf20-e4231690f35c	order	f	f	f	2026-07-07 06:26:48.774
8f055950-4c40-4a6a-b907-b4c7708e81b0	19ce4223-979d-4c00-9d94-e0c498579e93	order_placed	Order confirmed	Your order for "Cricket bat legend" is confirmed. The seller will dispatch soon.	397d3322-e144-444b-aa0c-8eeb439efc69	order	f	f	f	2026-07-07 07:54:27.233
f99f1791-5877-47ce-a877-9dd76b358256	b3a05005-de0b-44fb-a34c-e18e76facc70	order_placed	New sale!	You've sold "Cricket bat legend". Please dispatch within 3 days.	397d3322-e144-444b-aa0c-8eeb439efc69	order	f	f	f	2026-07-07 07:54:27.233
f14f8096-4a28-4b2b-b770-c2e4bfd339ed	b3a05005-de0b-44fb-a34c-e18e76facc70	counter_offer_declined	Counter offer expired	Your counter offer of 42.00 on "[TEST] Nike Mercurial Football Boots" expired without a response.	42540a82-fe1e-46fd-ba08-1861e191988d	counter_offer	f	f	f	2026-07-07 12:00:00.181
4506e78a-9895-4e3f-b99f-dbbd907321be	b3a05005-de0b-44fb-a34c-e18e76facc70	offer_received	New offer received	You have a new offer of 30.00 on "Tennis ball in good condition"	759c7e25-c6ee-4b57-989f-e0d3fffa0c7a	offer	f	f	f	2026-07-07 12:27:06.227
bc29ee38-c9da-4385-9bdf-54d1bc360308	19ce4223-979d-4c00-9d94-e0c498579e93	order_placed	Order confirmed	Your order for "[TEST] New Balance Fresh Foam Running Shoes" is confirmed. The seller will dispatch soon.	02523d6d-0d61-41c0-b35a-b194548725c7	order	f	f	f	2026-07-08 06:50:11.773
187b5dc8-c382-46a8-99ce-7a1b666dc240	b3a05005-de0b-44fb-a34c-e18e76facc70	order_placed	New sale!	You've sold "[TEST] New Balance Fresh Foam Running Shoes". Please dispatch within 3 days.	02523d6d-0d61-41c0-b35a-b194548725c7	order	f	f	f	2026-07-08 06:50:11.773
828dd337-1dd5-4e10-a1a1-77e455fc8cfe	b3a05005-de0b-44fb-a34c-e18e76facc70	order_placed	New sale!	You've sold "[TEST] Babolat Pure Drive Tennis Racket". Please dispatch within 3 days.	5898200e-656c-4357-be66-224d1034bf42	order	f	f	f	2026-07-08 08:06:12.708
e30e752c-1cbc-4525-953c-21e1157856b2	19ce4223-979d-4c00-9d94-e0c498579e93	dispatched	Your order is on its way	"Cricket bat legend" has been dispatched. Tracking: JDO397D3322	397d3322-e144-444b-aa0c-8eeb439efc69	order	f	f	f	2026-07-09 12:53:11.378
9f0a3bc9-3a28-4d94-930f-0f96065ea018	b3a05005-de0b-44fb-a34c-e18e76facc70	payout_initiated	Payout pending	Payment for "Cricket bat legend" is queued for payout.	397d3322-e144-444b-aa0c-8eeb439efc69	order	f	f	f	2026-07-09 12:53:45.713
6b631486-17f5-4510-8404-09b42299a0cf	b3a05005-de0b-44fb-a34c-e18e76facc70	review_received	You received a new review	A buyer rated your sale of "Cricket bat legend" 5/5 stars.	b3e87729-4804-4565-854d-a51207726dc7	review	f	f	f	2026-07-09 12:53:55.753
ecb72839-d1a7-41ca-a27d-a7c4bfd82b90	da804619-9850-49d6-a79f-9ddc7ccd6b96	dispatched	Your order is on its way	"Tennis Racket and ball" has been dispatched. Tracking: JDO5F2181C4	5f2181c4-aca1-4736-bf20-e4231690f35c	order	f	f	f	2026-07-09 12:55:31.01
677afa4b-b4c3-43f7-93b6-66885d847b16	3848d9ae-cf93-4532-a774-541752473dc4	dispute_raised	New dispute raised	Dispute raised on "Cricket Bat Legend". ID: 30ed307f.	30ed307f-232c-4efe-a827-8009ada9d117	dispute	f	f	f	2026-07-09 12:56:53.108
579cc471-900d-4743-b3cf-ba8310d785d5	62bebcd0-88aa-4777-89c0-33e51b4a66e3	dispute_raised	New dispute raised	Dispute raised on "Cricket Bat Legend". ID: 30ed307f.	30ed307f-232c-4efe-a827-8009ada9d117	dispute	f	f	f	2026-07-09 12:56:53.108
9f554aff-b5e8-4623-91fb-c38f170acccd	b3a05005-de0b-44fb-a34c-e18e76facc70	dispute_raised	A dispute has been raised	The buyer raised a dispute on "Cricket Bat Legend". Respond within 48 hours.	30ed307f-232c-4efe-a827-8009ada9d117	dispute	t	f	f	2026-07-09 12:56:53.103
05c15780-91e6-4a1c-bd27-f0d716ecbedd	19ce4223-979d-4c00-9d94-e0c498579e93	dispute_raised	Seller responded to your dispute	The seller has submitted a response. Our team will now review both sides.	30ed307f-232c-4efe-a827-8009ada9d117	dispute	t	f	f	2026-07-09 13:10:21.434
f7031ea7-061c-4a02-a45e-1e02bd50e78c	19ce4223-979d-4c00-9d94-e0c498579e93	order_placed	Order confirmed	Your order for "[TEST] Babolat Pure Drive Tennis Racket" is confirmed. The seller will dispatch soon.	5898200e-656c-4357-be66-224d1034bf42	order	t	f	f	2026-07-08 08:06:12.708
4d723722-ccbf-4e49-8edc-5e342ce54735	19ce4223-979d-4c00-9d94-e0c498579e93	dispatched	Your order is on its way	"Cricket Bat Legend" has been dispatched. Tracking: JDO3624B79	3624b279-85c9-46e4-a458-4accb193119f	order	t	f	f	2026-07-09 12:55:57.419
976a0a6f-968c-4707-95bd-14c85d0d4202	19ce4223-979d-4c00-9d94-e0c498579e93	delivered	Thanks for your purchase!	Your order for "Cricket bat legend" is complete. Payment has been released to the seller.	397d3322-e144-444b-aa0c-8eeb439efc69	order	t	f	f	2026-07-09 12:53:45.713
\.


--
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offers (id, listing_id, buyer_id, seller_id, status, last_message_at, last_message_preview, buyer_unread_count, seller_unread_count, created_at, updated_at) FROM stdin;
21bcbe73-660f-4e4c-b397-24eb5d7d1133	e1c16426-cafc-4a2b-8fa4-fc4b4917b29b	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	active	2026-07-06 08:00:26.557	i can do at 38	0	1	2026-07-06 06:53:51.957	2026-07-06 08:00:26.587
27dd4f8b-1412-4cd6-9a04-8c11c6e736b9	6ff4f50e-438e-43c0-9db4-52fa844fc735	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	active	2026-07-07 05:56:18.24	i want to have it a 60	0	1	2026-07-07 05:56:05.87	2026-07-07 05:56:18.26
759c7e25-c6ee-4b57-989f-e0d3fffa0c7a	1575607a-7e2a-49a5-8b86-6cdb84ec7bc8	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	active	2026-07-07 12:27:06.192	Offered 30.00	0	1	2026-07-07 12:26:46.922	2026-07-07 12:27:06.218
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, listing_id, buyer_id, seller_id, item_price, shipping_fee, buyer_protection_fee, platform_commission, total_amount, seller_net_amount, fulfilment_status, payment_status, dispute_status, tracking_number, dispatched_at, delivered_at, completed_at, delivery_address_line1, delivery_address_line2, delivery_city, delivery_postcode, agreed_price, snapshot_listing_title, snapshot_condition, snapshot_photos, dispute_window_expires_at, created_at, updated_at) FROM stdin;
928e63d0-4f58-4ebe-a056-0310480d1756	2087fe15-c195-4a92-8e31-a945f7650316	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	85.00	6.99	4.25	8.50	96.24	76.50	completed	released	none	RM123456789GB	2026-06-26 06:53:51.916	2026-06-28 06:53:51.916	2026-06-29 06:53:51.916	12 Test Street	\N	London	SW1A 1AA	\N	Gray-Nicolls Kronus Cricket Bat	like_new	["https://res.cloudinary.com/kitloop/image/upload/test/cricket-bat-1.jpg", "https://res.cloudinary.com/kitloop/image/upload/test/cricket-bat-2.jpg"]	2026-07-01 06:53:51.916	2026-07-06 06:53:51.92	2026-07-06 06:53:51.92
d4e8be01-f064-497f-8136-c632ae417de4	3ba9d981-f8f2-4880-a622-bfdda5d87ee1	8ba77c5c-e401-4529-8680-67bef9367d81	b3a05005-de0b-44fb-a34c-e18e76facc70	120.00	5.99	6.00	12.00	131.99	108.00	dispatched	held	none	RM987654321GB	2026-07-04 06:53:51.994	\N	\N	45 Racket Road	\N	Manchester	M1 1AA	\N	Babolat Pure Drive Tennis Racket	new_with_tags	["https://res.cloudinary.com/kitloop/image/upload/test/tennis-racket-1.jpg", "https://res.cloudinary.com/kitloop/image/upload/test/tennis-racket-2.jpg", "https://res.cloudinary.com/kitloop/image/upload/test/tennis-racket-3.jpg"]	2026-07-09 06:53:51.994	2026-07-06 06:53:51.996	2026-07-06 06:53:51.996
02523d6d-0d61-41c0-b35a-b194548725c7	8fe71aa0-1129-499b-b849-0669a731155d	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	65.00	4.99	3.25	6.50	73.24	58.50	awaiting_dispatch	held	none	\N	\N	\N	\N	Flat 3B, 12 Elm Avenue	\N	London	SW1A 1AA	\N	[TEST] New Balance Fresh Foam Running Shoes	like_new	["https://res.cloudinary.com/kitloop/image/upload/test/running-shoes-1.jpg", "https://res.cloudinary.com/kitloop/image/upload/test/running-shoes-2.jpg"]	2026-07-11 06:50:11.722	2026-07-08 06:50:11.755	2026-07-08 06:50:11.755
5898200e-656c-4357-be66-224d1034bf42	3ba9d981-f8f2-4880-a622-bfdda5d87ee1	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	120.00	5.99	6.00	12.00	131.99	108.00	awaiting_dispatch	held	none	\N	\N	\N	\N	Flat 3B, 12 Elm Avenue	\N	London	SW1A 1AA	\N	[TEST] Babolat Pure Drive Tennis Racket	new_with_tags	["https://res.cloudinary.com/kitloop/image/upload/test/tennis-racket-1.jpg", "https://res.cloudinary.com/kitloop/image/upload/test/tennis-racket-2.jpg", "https://res.cloudinary.com/kitloop/image/upload/test/tennis-racket-3.jpg"]	2026-07-11 08:06:12.574	2026-07-08 08:06:12.663	2026-07-08 08:06:12.663
397d3322-e144-444b-aa0c-8eeb439efc69	6ac59c36-530a-4921-838b-8d7bc4a4c0e4	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	10.00	8.99	0.50	1.00	19.49	9.00	completed	released	none	JDO397D3322	2026-07-09 12:53:11.291	2026-07-09 12:53:45.656	2026-07-09 12:53:45.656	Flat 3B, 12 Elm Avenue	\N	London	SW1A 1AA	\N	Cricket bat legend	good	["https://res.cloudinary.com/re7qlgis/image/upload/v1783323497/kit-loop/listings/photos/i8tan0cummbg0jzv7n8b.jpg"]	2026-07-12 12:53:11.291	2026-07-07 07:54:27.194	2026-07-09 12:53:45.676
5f2181c4-aca1-4736-bf20-e4231690f35c	6ff4f50e-438e-43c0-9db4-52fa844fc735	da804619-9850-49d6-a79f-9ddc7ccd6b96	b3a05005-de0b-44fb-a34c-e18e76facc70	65.00	8.99	3.25	6.50	77.24	58.50	dispatched	held	none	JDO5F2181C4	2026-07-09 12:55:30.978	\N	\N	House no 1, Blue avenue	\N	London	SW1A 1AA	\N	Tennis Racket and ball	good	["https://res.cloudinary.com/re7qlgis/image/upload/v1783403651/kit-loop/listings/photos/ptqsltn0iae4qfgdvfun.jpg"]	2026-07-12 12:55:30.978	2026-07-07 06:26:48.744	2026-07-09 12:55:30.981
3624b279-85c9-46e4-a458-4accb193119f	fea7e0cb-3357-471b-91e6-bbc209b070bd	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	50.00	8.99	2.50	5.00	61.49	45.00	dispatched	held	active	JDO3624B79	2026-07-09 12:55:57.391	\N	\N	Flat 3B, 12 Elm Avenue	\N	London	NW10 3DW	\N	Cricket Bat Legend	good	["https://res.cloudinary.com/re7qlgis/image/upload/v1783324718/kit-loop/listings/photos/ps1gdumpf4rjalnatepq.jpg"]	2026-07-12 12:55:57.391	2026-07-06 14:01:50.711	2026-07-09 12:56:53.067
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, buyer_id, seller_id, stripe_payment_intent_id, stripe_charge_id, stripe_transfer_id, stripe_refund_id, amount_total, amount_item, amount_shipping, amount_buyer_protection, amount_commission, amount_seller_payout, amount_refunded, currency, payment_method, payment_status, escrow_status, payout_status, payout_initiated_at, payout_completed_at, refund_reason, shipping_fee_refunded, stripe_webhook_events, created_at, updated_at) FROM stdin;
4e8ecd15-914e-4643-b386-ccdb5300ba0d	928e63d0-4f58-4ebe-a056-0310480d1756	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	pi_test_seed_completed_order_001	ch_test_seed_completed_order_001	tr_test_seed_completed_order_001	\N	96.24	85.00	6.99	4.25	8.50	76.50	0.00	GBP	card	succeeded	released	completed	2026-06-29 06:53:51.916	2026-07-01 06:53:51.916	\N	f	\N	2026-07-06 06:53:51.929	2026-07-06 06:53:51.929
2b7e27fb-8ea9-4d66-b123-033355f4e029	3624b279-85c9-46e4-a458-4accb193119f	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	pi_3TqD5XFTl4bB00Kc0CXLVo4W	ch_3TqD5XFTl4bB00Kc0dvjYAMC	\N	\N	61.49	50.00	8.99	2.50	5.00	45.00	0.00	GBP	card	succeeded	held	\N	\N	\N	\N	f	\N	2026-07-06 14:01:50.732	2026-07-06 14:01:50.732
6b8e6110-24de-4624-83ca-e2f8e0495798	5f2181c4-aca1-4736-bf20-e4231690f35c	da804619-9850-49d6-a79f-9ddc7ccd6b96	b3a05005-de0b-44fb-a34c-e18e76facc70	pi_3TqSSfFTl4bB00Kc0gf1NW2y	ch_3TqSSfFTl4bB00Kc03WKpett	\N	\N	77.24	65.00	8.99	3.25	6.50	58.50	0.00	GBP	card	succeeded	held	\N	\N	\N	\N	f	\N	2026-07-07 06:26:48.763	2026-07-07 06:26:48.763
30fd0aaa-f414-4d2d-bef1-c81314b0a2d2	02523d6d-0d61-41c0-b35a-b194548725c7	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	pi_3TqpIsFTl4bB00Kc0ZuLMabt	ch_3TqpIsFTl4bB00Kc0OokVe6o	\N	\N	73.24	65.00	4.99	3.25	6.50	58.50	0.00	GBP	card	succeeded	held	\N	\N	\N	\N	f	\N	2026-07-08 06:50:11.762	2026-07-08 06:50:11.762
8dd12cb8-28c0-47a6-a4a3-5cdfaaef2254	5898200e-656c-4357-be66-224d1034bf42	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	pi_3TqqUNFTl4bB00Kc1jbQphHT	ch_3TqqUNFTl4bB00Kc1cZntQYk	\N	\N	131.99	120.00	5.99	6.00	12.00	108.00	0.00	GBP	card	succeeded	held	\N	\N	\N	\N	f	\N	2026-07-08 08:06:12.69	2026-07-08 08:06:12.69
2071ba02-6b11-4561-9982-4080fcb5419b	397d3322-e144-444b-aa0c-8eeb439efc69	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	pi_3TqTpXFTl4bB00Kc0PTdog7q	ch_3TqTpXFTl4bB00Kc0t0PaORB	\N	\N	19.49	10.00	8.99	0.50	1.00	9.00	0.00	GBP	card	succeeded	released	pending	\N	\N	\N	f	\N	2026-07-07 07:54:27.215	2026-07-09 12:53:45.703
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, order_id, reviewer_id, seller_id, rating, body, is_visible, removed_by_admin, removal_reason, created_at, updated_at) FROM stdin;
32b13b6f-63bc-4329-9b75-a911aba422cb	928e63d0-4f58-4ebe-a056-0310480d1756	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	5	Great seller, item exactly as described and dispatched promptly. Would buy from again.	t	f	\N	2026-07-06 06:53:51.935	2026-07-06 06:53:51.935
b3e87729-4804-4565-854d-a51207726dc7	397d3322-e144-444b-aa0c-8eeb439efc69	19ce4223-979d-4c00-9d94-e0c498579e93	b3a05005-de0b-44fb-a34c-e18e76facc70	5	very good awesome	t	f	\N	2026-07-09 12:53:55.721	2026-07-09 12:53:55.721
\.


--
-- Data for Name: seller_badges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seller_badges (id, seller_id, admin_id, action, reason, unmet_criteria, reapplication_eligible_at, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, user_agent, ip_address, expires_at, revoked_at, last_used_at, created_at) FROM stdin;
75aa361d-9e5f-4f49-8b8b-cce2ffdedad7	3848d9ae-cf93-4532-a774-541752473dc4	curl/8.19.0	::1	2026-10-05 11:09:18.925	\N	\N	2026-07-07 11:09:18.931
78d34338-df60-4a8b-8125-1d628499c168	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-05 11:37:43.648	2026-07-06 11:37:43.656	2026-07-06 11:37:43.648	2026-07-06 11:30:17.285
6444b7a8-93a0-47b2-9585-a04ffc745e6e	62bebcd0-88aa-4777-89c0-33e51b4a66e3	curl/8.19.0	::1	2026-07-30 13:15:52.5	\N	2026-06-30 13:15:52.5	2026-06-30 13:15:52.221
17447d6f-4434-4e07-826c-9087893a1d4a	b55eae55-51f3-492a-8f3b-b71026bb2f16	Mozilla/5.0	::1	2026-07-30 13:18:47.953	\N	2026-06-30 13:18:47.953	2026-06-30 13:10:14.193
165df1ce-2c32-4f61-afce-7b8edb08b0e2	7afca83c-bda7-483e-ab3c-7d70d13ff2c2	curl/8.19.0	::1	2026-07-30 09:04:44.647	\N	\N	2026-06-30 09:04:44.649
77590228-090f-4a8f-bc21-afb4c166f62d	7afca83c-bda7-483e-ab3c-7d70d13ff2c2	curl/8.19.0	::1	2026-07-30 09:05:22.386	\N	\N	2026-06-30 09:05:22.386
f32a5e36-663e-477b-83f5-6380dc2812f9	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-05 13:11:58.615	2026-07-06 13:11:58.632	2026-07-06 13:11:58.615	2026-07-06 13:08:19.867
d8d3200f-a3a1-49b6-8c92-162096698817	7afca83c-bda7-483e-ab3c-7d70d13ff2c2	curl/8.19.0	::1	2026-07-30 09:05:00.284	2026-06-30 09:05:40.781	2026-06-30 09:05:40.78	2026-06-30 09:05:00.284
349867a7-d1be-43ee-8432-da473689cb90	c918ae51-01c2-4dd6-8f92-5e1e53cf44bc	curl/8.19.0	::1	2026-07-30 08:59:49.696	2026-06-30 09:11:32.325	2026-06-30 09:02:32.035	2026-06-30 08:59:49.699
04bf2b1e-2ff6-4c86-9aa6-96e0f2210c3b	c918ae51-01c2-4dd6-8f92-5e1e53cf44bc	curl/8.19.0	::1	2026-07-30 09:11:32.787	\N	\N	2026-06-30 09:11:32.788
6d134ad0-2f7e-40df-a09d-71bb59c25152	c918ae51-01c2-4dd6-8f92-5e1e53cf44bc	curl/8.19.0	::1	2026-07-30 09:11:43.301	\N	2026-06-30 09:11:43.559	2026-06-30 09:11:43.301
ea23719a-fed6-49cc-80d0-843270bdec6f	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-05 11:39:03.567	2026-07-06 11:39:03.572	2026-07-06 11:39:03.567	2026-07-06 11:38:27.414
a2eeac4b-6bd7-4f3e-9feb-31258d821954	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-05 12:52:55.028	2026-07-06 12:52:55.032	2026-07-06 12:52:55.028	2026-07-06 12:35:38.826
beba3c6d-cca4-47b2-8ac6-59f3bcf2a07f	80e02dcb-db5b-48c4-a53e-2596e1454fd8	curl/8.19.0	::1	2026-09-28 11:28:21.983	\N	\N	2026-06-30 11:28:21.983
2b61706f-173c-4092-85f8-e9d9fe4c68bf	b3a05005-de0b-44fb-a34c-e18e76facc70	Mozilla/5.0	::1	2026-08-05 07:59:55.558	2026-07-06 07:59:55.563	2026-07-06 07:59:55.558	2026-07-06 07:57:03.073
119abc14-2ba2-41f2-8361-670d0779ec09	80e02dcb-db5b-48c4-a53e-2596e1454fd8	Mozilla/5.0	::1	2026-07-30 11:29:03.006	2026-06-30 11:29:58.852	2026-06-30 11:29:03.006	2026-06-30 11:28:34.393
fa8c8737-edbf-450f-8e93-a0fda9fb7a04	80e02dcb-db5b-48c4-a53e-2596e1454fd8	curl/8.19.0	::1	2026-07-30 11:29:58.919	2026-06-30 11:29:58.924	2026-06-30 11:29:58.919	2026-06-30 11:27:48.089
a26c81ff-5eef-45e5-850d-9365d35b975c	22d6a9d2-e3e1-46f7-b265-fd48a1f9e100	axios/1.18.1	::1	2026-07-30 11:33:49.763	\N	2026-06-30 11:33:49.763	2026-06-30 11:33:49.742
746347cc-82b8-41af-ba0b-d674143a3bca	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-05 12:53:23.544	2026-07-06 12:53:23.561	2026-07-06 12:53:23.544	2026-07-06 12:52:56.938
7d95f288-44ae-426a-825b-a37fd21733b4	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-05 13:05:14.537	2026-07-06 13:05:14.545	2026-07-06 13:05:14.537	2026-07-06 12:56:26.733
27ee3532-8921-4e70-9f56-692860d7dcb0	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-05 14:02:11.309	2026-07-06 14:02:11.316	2026-07-06 14:02:11.309	2026-07-06 13:32:01.608
086bcf72-91fb-4c50-a515-3dfb72368637	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-05 11:40:30.825	2026-07-06 11:40:30.828	2026-07-06 11:40:30.825	2026-07-06 11:39:21.995
749736f7-1f65-40d9-b670-171ae921dbae	b55eae55-51f3-492a-8f3b-b71026bb2f16	Mozilla/5.0	::1	2026-07-30 13:10:06.023	2026-06-30 13:10:06.035	2026-06-30 13:10:06.023	2026-06-30 12:03:17.106
313be4a3-2e62-4e13-99fc-b1718a819497	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-05 11:40:50.247	2026-07-06 11:40:50.25	2026-07-06 11:40:50.247	2026-07-06 11:40:37.338
baac477b-310c-4465-8348-d84b5425d5a3	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-05 12:54:29.36	2026-07-06 12:54:29.364	2026-07-06 12:54:29.36	2026-07-06 12:53:36.238
380c2a4f-b42c-4537-a12f-52af4af4d08e	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-05 13:05:48.436	2026-07-06 13:05:48.44	2026-07-06 13:05:48.436	2026-07-06 13:05:20.727
f2519a3d-3fdd-49ac-8336-1f6105e7da26	62bebcd0-88aa-4777-89c0-33e51b4a66e3	Mozilla/5.0	::1	2026-07-31 10:47:31.83	2026-07-01 10:47:31.835	2026-07-01 10:47:31.83	2026-06-30 13:19:09.786
5b59785c-93ec-4d8e-8a09-b4c67e24c0f5	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-05 12:54:53.171	2026-07-06 12:54:53.175	2026-07-06 12:54:53.171	2026-07-06 12:54:34.494
5f68ffb8-6e6d-4663-9405-26114499c4a2	b3a05005-de0b-44fb-a34c-e18e76facc70	Mozilla/5.0	::1	2026-08-05 07:55:14.897	2026-07-06 07:55:14.901	2026-07-06 07:55:14.897	2026-07-06 07:47:35.801
d3cb009b-a464-4e73-9d32-a44b386de687	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-05 11:30:06.925	2026-07-06 11:30:06.928	2026-07-06 11:30:06.925	2026-07-06 08:00:12.684
17497191-c184-4e22-938a-f96530129caf	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-05 11:50:33.576	2026-07-06 11:50:33.582	2026-07-06 11:50:33.576	2026-07-06 11:41:01.371
3cf556d2-71bc-4818-a3f1-7b23c2be1ddd	b3a05005-de0b-44fb-a34c-e18e76facc70	Mozilla/5.0	::1	2026-08-05 07:44:02.899	2026-07-06 07:44:02.903	2026-07-06 07:44:02.899	2026-07-06 06:59:24.639
75584869-86dc-40de-8571-319cbb5f76ed	3848d9ae-cf93-4532-a774-541752473dc4	curl/8.19.0	::1	2026-08-05 12:11:27.914	\N	2026-07-06 12:11:27.914	2026-07-06 12:02:27.447
a75bc2ca-982d-433f-bba3-e027f5ff1c99	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-05 12:35:30.032	2026-07-06 12:35:30.039	2026-07-06 12:35:30.032	2026-07-06 11:50:41.321
17630e74-1fc4-4ed7-a2b8-d7461da3114d	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-05 13:06:29.122	2026-07-06 13:06:29.125	2026-07-06 13:06:29.122	2026-07-06 13:06:04.324
6e10159b-3ee7-4fab-b417-daf95232cf4b	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-05 13:17:48.72	2026-07-06 13:17:48.724	2026-07-06 13:17:48.72	2026-07-06 13:12:05.503
9dbcad09-641e-4e28-82e3-e1195772b93a	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-06 06:17:18.673	2026-07-07 06:17:18.676	2026-07-07 06:17:18.673	2026-07-07 05:55:55.258
6a2cacf0-107f-477b-b1d8-5555dd9aceea	b3a05005-de0b-44fb-a34c-e18e76facc70	Mozilla/5.0	::1	2026-08-06 05:55:44.789	2026-07-07 05:55:44.792	2026-07-07 05:55:44.789	2026-07-06 14:02:20.986
55c89be6-7017-44d8-8a67-3c4f5bfcc756	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-05 13:07:48.501	2026-07-06 13:07:48.504	2026-07-06 13:07:48.501	2026-07-06 13:06:38.832
1f818a8c-3298-48e8-94b6-fd6b4db74c15	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-05 13:08:10.918	2026-07-06 13:08:10.923	2026-07-06 13:08:10.918	2026-07-06 13:08:04.88
ff95a71b-b4e7-443a-a969-6f6b2cb9b4f8	da804619-9850-49d6-a79f-9ddc7ccd6b96	Mozilla/5.0	::1	2026-08-06 07:43:16.166	2026-07-07 07:43:16.175	2026-07-07 07:43:16.166	2026-07-07 06:18:26.325
eec783cf-c55c-4706-996a-4175adff775d	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-06 12:37:52.746	2026-07-07 12:37:52.749	2026-07-07 12:37:52.746	2026-07-07 12:37:04.232
3096cffb-e0d9-44cb-924a-62488ab886db	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-06 12:02:18.137	2026-07-07 12:02:18.14	2026-07-07 12:02:18.137	2026-07-07 12:01:33.348
6fcf348f-113f-4ec3-9e72-0e6d91dba926	b3a05005-de0b-44fb-a34c-e18e76facc70	Mozilla/5.0	::1	2026-08-06 07:45:59.744	2026-07-07 07:45:59.749	2026-07-07 07:45:59.744	2026-07-07 07:43:27.793
64651946-b205-4b6a-aff2-55fe0be281e5	b3a05005-de0b-44fb-a34c-e18e76facc70	Mozilla/5.0	::1	2026-08-07 06:46:09.988	2026-07-08 06:46:09.993	2026-07-08 06:46:09.988	2026-07-08 06:37:14.098
f2cc9ddf-43d3-45ff-9023-1a6c45b6825a	b3a05005-de0b-44fb-a34c-e18e76facc70	Mozilla/5.0	::1	2026-08-06 12:10:52.45	2026-07-07 12:10:52.456	2026-07-07 12:10:52.45	2026-07-07 12:02:27.415
48d4619d-6638-4861-b18a-0b65b86f8621	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-06 11:55:23.691	2026-07-07 11:55:23.694	2026-07-07 11:55:23.691	2026-07-07 07:46:08.178
11bbd093-b953-47ec-a821-f450a6bbd5da	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-07 08:11:41.553	2026-07-08 08:11:41.557	2026-07-08 08:11:41.553	2026-07-08 08:09:26.013
7727fc8e-adfa-44c2-970a-c679d4652cef	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-08 11:52:27.663	2026-07-09 11:52:27.67	2026-07-09 11:52:27.663	2026-07-09 11:33:20.125
b52a42ba-40aa-4a34-b616-eb5eeb8998ea	b3a05005-de0b-44fb-a34c-e18e76facc70	Mozilla/5.0	::1	2026-08-08 12:53:22.933	2026-07-09 12:53:22.936	2026-07-09 12:53:22.933	2026-07-09 12:27:40.544
0d24d80b-3e2b-47fd-84f9-9b717934662d	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-08 12:27:33.567	2026-07-09 12:27:33.577	2026-07-09 12:27:33.567	2026-07-09 11:52:41.342
b5b5ced3-9566-434f-8415-bd36f24c4edd	b3a05005-de0b-44fb-a34c-e18e76facc70	Mozilla/5.0	::1	2026-08-08 11:33:11.512	2026-07-09 11:33:11.518	2026-07-09 11:33:11.512	2026-07-08 15:11:00.209
ccf569f1-0b24-4f7e-b6f1-30eb94e13c4f	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-06 12:22:53.5	2026-07-07 12:22:53.509	2026-07-07 12:22:53.5	2026-07-07 12:16:52.681
e128ed2d-db8f-40fb-9525-6f8c9d559c37	b3a05005-de0b-44fb-a34c-e18e76facc70	Mozilla/5.0	::1	2026-08-08 12:56:10.212	2026-07-09 12:56:10.215	2026-07-09 12:56:10.212	2026-07-09 12:54:09.918
e72ab240-4d9a-4e90-a0f2-51393398f2d7	b3a05005-de0b-44fb-a34c-e18e76facc70	Mozilla/5.0	::1	2026-08-07 08:09:11.99	2026-07-08 08:09:11.997	2026-07-08 08:09:11.99	2026-07-08 08:06:58.158
3c7b4ece-8afe-4e20-afeb-ed8ba11c7898	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-07 15:10:52.918	2026-07-08 15:10:52.926	2026-07-08 15:10:52.918	2026-07-08 15:08:12.683
287418a6-b655-4944-b2bf-8bab4294c8dc	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-06 12:36:53.375	2026-07-07 12:36:53.379	2026-07-07 12:36:53.375	2026-07-07 12:26:36.763
9a52492a-01df-4dc3-891a-9a20658205d2	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-06 12:16:34.777	2026-07-07 12:16:34.783	2026-07-07 12:16:34.777	2026-07-07 12:11:05.572
6378f5eb-5791-4f38-9abd-fed62c9f61c0	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-06 12:01:25.318	2026-07-07 12:01:25.324	2026-07-07 12:01:25.318	2026-07-07 11:55:41.606
25693a86-164f-4412-b744-fcc1c0db1b15	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-07 15:06:08.074	2026-07-08 15:06:08.085	2026-07-08 15:06:08.074	2026-07-08 14:36:54.359
3735ddc5-a43b-4c17-9750-786185f58a68	3848d9ae-cf93-4532-a774-541752473dc4	curl/8.19.0	::1	2026-08-06 11:09:40.702	\N	2026-07-07 11:09:40.702	2026-07-07 11:09:40.234
fb642250-1701-47e8-9776-83778b3ca38a	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-07 06:49:15.228	2026-07-08 06:49:15.23	2026-07-08 06:49:15.228	2026-07-08 06:46:18.625
f42777ef-99ed-4103-809f-d1f6e8effa46	3848d9ae-cf93-4532-a774-541752473dc4	Mozilla/5.0	::1	2026-08-06 12:16:50.486	2026-07-07 12:16:50.494	2026-07-07 12:16:50.486	2026-07-07 12:16:40.668
2f0e9973-15bc-4b8d-9f20-91ae1e26f1dd	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-08 12:54:05.202	2026-07-09 12:54:05.204	2026-07-09 12:54:05.202	2026-07-09 12:53:29.387
e5b14163-6b95-4467-bdee-d7625dcfd05c	b3a05005-de0b-44fb-a34c-e18e76facc70	Mozilla/5.0	::1	2026-08-06 12:26:28.655	2026-07-07 12:26:28.658	2026-07-07 12:26:28.655	2026-07-07 12:23:03.317
b6939957-7ba3-4720-928e-f2d5abd0b805	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-08 12:57:00.304	2026-07-09 12:57:00.306	2026-07-09 12:57:00.304	2026-07-09 12:56:17.604
d0f0279c-5ad3-4812-a301-e678aabc07a6	b3a05005-de0b-44fb-a34c-e18e76facc70	Mozilla/5.0	::1	2026-08-07 15:08:03.705	2026-07-08 15:08:03.708	2026-07-08 15:08:03.705	2026-07-08 15:06:15.162
6f9864db-a55e-4644-804b-5ed87778c848	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-07 08:06:51.405	2026-07-08 08:06:51.41	2026-07-08 08:06:51.405	2026-07-08 06:49:22.579
95400595-35c4-41a6-906d-ae0b2267fb87	b3a05005-de0b-44fb-a34c-e18e76facc70	Mozilla/5.0	::1	2026-08-08 13:10:29.303	2026-07-09 13:10:29.308	2026-07-09 13:10:29.303	2026-07-09 12:57:04.975
44b555e9-c33c-49a8-9cd7-7a0c2ac856b6	19ce4223-979d-4c00-9d94-e0c498579e93	Mozilla/5.0	::1	2026-08-23 12:59:23.333	\N	2026-07-24 12:59:23.333	2026-07-09 13:10:36.3
\.


--
-- Data for Name: shares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shares (id, listing_id, user_id, destination, surface, created_at) FROM stdin;
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_settings (id, setting_key, setting_value, updated_by, created_at, updated_at) FROM stdin;
4a1f3a10-c394-44fa-b141-bef7f456dd12	homepage_hero_image_url	https://res.cloudinary.com/re7qlgis/image/upload/v1783425668/kit-loop/listings/photos/ro9oonjpcm3zgovmgoo4.jpg	3848d9ae-cf93-4532-a774-541752473dc4	2026-07-07 11:09:40.492	2026-07-07 12:01:09.06
\.


--
-- Data for Name: sports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sports (id, name, slug, icon_url, sport_tag, display_order, status, seasonal_highlight, seasonal_highlight_start, seasonal_highlight_end, listing_count, created_at, updated_at) FROM stdin;
a6910ea0-b215-4eda-bdba-e9a2a1827de4	Cricket	cricket	https://res.cloudinary.com/re7qlgis/image/upload/v1783341356/kit-loop/listings/photos/d2qsdp5p0l5wukfclvqj.jpg	bat_ball	1	active	f	\N	\N	0	2026-06-30 12:51:58.049	2026-07-06 12:35:58.44
32f0204a-3178-4e18-9404-0d2eeea77a77	Golf	golf	https://res.cloudinary.com/re7qlgis/image/upload/v1783341448/kit-loop/listings/photos/j2x77gqur0c6zd13qaux.jpg	precision	3	active	f	\N	\N	0	2026-06-30 12:51:58.33	2026-07-06 12:37:37.609
c4f15d98-401e-4020-b136-b0148a820978	Boxing & MMA	boxing-mma	https://assets.kitloop.com/sports/boxing-and-mma.svg	combat	17	hidden	f	\N	\N	0	2026-06-30 12:51:58.374	2026-07-06 12:53:58.337
37a51d15-a650-439c-991d-26f4c9bcf296	Padel	padel	https://assets.kitloop.com/sports/padel.svg	racket	5	hidden	f	\N	\N	0	2026-06-30 12:51:58.337	2026-07-06 12:57:17.47
e4c80b3c-0d2c-44c7-b6c7-cbff417137e1	Squash	squash	https://assets.kitloop.com/sports/squash.svg	racket	6	hidden	f	\N	\N	0	2026-06-30 12:51:58.339	2026-07-06 12:57:25.83
ae4d3a1d-ead1-4558-9aaf-18c3de5952d2	Ice Hockey	ice-hockey	https://assets.kitloop.com/sports/ice-hockey.svg	team	11	hidden	f	\N	\N	0	2026-06-30 12:51:58.356	2026-07-06 12:57:46.746
c7bc85fd-9db3-4556-b348-6eacbb157a56	Netball	netball	https://assets.kitloop.com/sports/netball.svg	team	12	hidden	f	\N	\N	0	2026-06-30 12:51:58.358	2026-07-06 12:58:08.972
f709b1fc-2781-48ff-939d-580689ffaec9	Tennis	tennis	https://res.cloudinary.com/re7qlgis/image/upload/v1783342711/kit-loop/listings/photos/mx19amjtv0gfjmxhrwkv.jpg	racket	4	active	f	\N	\N	0	2026-06-30 12:51:58.334	2026-07-06 12:58:35.125
f3564474-bfe8-46b7-be46-69cf968406fa	Running	running	https://res.cloudinary.com/re7qlgis/image/upload/v1783342831/kit-loop/listings/photos/cabkod0qqzneurfbzlxf.jpg	endurance	7	active	f	\N	\N	0	2026-06-30 12:51:58.343	2026-07-06 13:00:40.396
d1fb5816-7587-439a-9597-c3af53fba403	Skiing	skiing	https://res.cloudinary.com/re7qlgis/image/upload/v1783342853/kit-loop/listings/photos/acqomvch7zm4qqy9nnof.jpg	snow	8	active	f	\N	\N	0	2026-06-30 12:51:58.348	2026-07-06 13:00:59.346
22cc1b43-16d9-4a1a-af14-2aa5fbe30cb9	American Football	american-football	https://res.cloudinary.com/re7qlgis/image/upload/v1783342870/kit-loop/listings/photos/kwxk05zglsyfh7epmgxm.jpg	team	9	active	f	\N	\N	0	2026-06-30 12:51:58.351	2026-07-06 13:01:17.955
baf3ad38-48c9-4ff7-96dc-ebd0a995fa2e	Cycling	cycling	https://res.cloudinary.com/re7qlgis/image/upload/v1783342968/kit-loop/listings/photos/qkjcrslomv8c2ok1p8sz.jpg	endurance	13	active	f	\N	\N	0	2026-06-30 12:51:58.361	2026-07-06 13:02:52.248
b9cbd9fd-c00d-4c0b-8fc0-1484bd645613	Swimming	swimming	https://res.cloudinary.com/re7qlgis/image/upload/v1783342989/kit-loop/listings/photos/hbljntnxmfyfm4aigjja.jpg	water	14	active	f	\N	\N	0	2026-06-30 12:51:58.365	2026-07-06 13:03:16.203
1be57f95-46ff-41af-a72b-c2969907432b	Rugby	rugby	https://res.cloudinary.com/re7qlgis/image/upload/v1783343085/kit-loop/listings/photos/mohanibda7a9m7uksfve.jpg	team	15	active	f	\N	\N	0	2026-06-30 12:51:58.367	2026-07-06 13:04:50.719
96e0f7bc-447e-4524-94cf-1f05250a1271	Badminton	badminton	https://res.cloudinary.com/re7qlgis/image/upload/v1783343103/kit-loop/listings/photos/o2in7voyhwupzmspjpsl.jpg	racket	16	active	f	\N	\N	0	2026-06-30 12:51:58.37	2026-07-06 13:05:08.508
5713ff8b-942d-48bd-ac82-7542f366b25b	Basketball	basketball	https://res.cloudinary.com/re7qlgis/image/upload/v1783343179/kit-loop/listings/photos/smsjuw90dbpk7cbpes3u.jpg	team	10	active	f	\N	\N	0	2026-06-30 12:51:58.354	2026-07-06 13:06:25.228
322ea332-632a-4090-8490-e37ce8a75313	Football	football	https://res.cloudinary.com/re7qlgis/image/upload/v1783339364/kit-loop/listings/photos/tegssc7hkeysijsltdyk.png	team	2	active	f	\N	\N	0	2026-06-30 12:51:58.324	2026-07-06 12:08:51.699
\.


--
-- Data for Name: sub_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sub_categories (id, sport_id, name, slug, recommended_parcel_size, is_oversized, display_order, status, listing_count, created_at, updated_at) FROM stdin;
2ad1ce3f-2af4-49fc-9bc0-bdd63e056340	a6910ea0-b215-4eda-bdba-e9a2a1827de4	Cricket gloves	cricket-gloves	small	f	4	active	0	2026-06-30 12:51:58.412	2026-07-06 05:14:09.824
2f012966-5d44-452c-8ba9-78e199327210	a6910ea0-b215-4eda-bdba-e9a2a1827de4	Cricket helmet	cricket-helmet	small	f	5	active	0	2026-06-30 12:51:58.414	2026-07-06 05:14:09.827
f2b96677-9620-422d-89d6-f145329d8820	a6910ea0-b215-4eda-bdba-e9a2a1827de4	Cricket ball	cricket-ball	small	f	6	active	0	2026-06-30 12:51:58.417	2026-07-06 05:14:09.83
dd748700-9483-429d-ae37-79a68d6b3e87	322ea332-632a-4090-8490-e37ce8a75313	Football boots	football-boots	small	f	1	active	0	2026-06-30 12:51:58.421	2026-07-06 05:14:09.835
abafbce5-8062-491e-af66-36065cf44214	322ea332-632a-4090-8490-e37ce8a75313	Football	football	small	f	2	active	0	2026-06-30 12:51:58.423	2026-07-06 05:14:09.837
444f67aa-d732-4217-b0a7-056dbec52fad	322ea332-632a-4090-8490-e37ce8a75313	Shin pads	shin-pads	small	f	3	active	0	2026-06-30 12:51:58.425	2026-07-06 05:14:09.84
4dec7262-b6d8-44af-acf5-2b1e4848442e	322ea332-632a-4090-8490-e37ce8a75313	Goalkeeper gloves	goalkeeper-gloves	small	f	4	active	0	2026-06-30 12:51:58.428	2026-07-06 05:14:09.842
f21ab6fa-633c-4140-8fc7-109551362d3e	322ea332-632a-4090-8490-e37ce8a75313	Football shirt	football-shirt	small	f	5	active	0	2026-06-30 12:51:58.43	2026-07-06 05:14:09.844
2544f6c7-e2b3-42c8-9df2-e72d149c56ae	32f0204a-3178-4e18-9404-0d2eeea77a77	Golf irons set	golf-irons-set	large	f	1	active	0	2026-06-30 12:51:58.432	2026-07-06 05:14:09.846
03dbfb4e-0239-4c29-9950-cd18f320cbfa	32f0204a-3178-4e18-9404-0d2eeea77a77	Golf wedge	golf-wedge	large	f	2	active	0	2026-06-30 12:51:58.434	2026-07-06 05:14:09.848
599f8317-8cad-4b2f-84eb-0cfe77789d55	32f0204a-3178-4e18-9404-0d2eeea77a77	Golf putter	golf-putter	large	f	3	active	0	2026-06-30 12:51:58.435	2026-07-06 05:14:09.85
f6a9134a-82de-4383-b120-9ae36a5f647c	32f0204a-3178-4e18-9404-0d2eeea77a77	Golf driver	golf-driver	oversized	t	4	active	0	2026-06-30 12:51:58.438	2026-07-06 05:14:09.854
db2abb39-b004-48a3-b67f-9ed6ce8e1f16	32f0204a-3178-4e18-9404-0d2eeea77a77	Golf bag	golf-bag	oversized	t	5	active	0	2026-06-30 12:51:58.441	2026-07-06 05:14:09.856
822c4d51-f470-4bc4-9e05-144263e80427	32f0204a-3178-4e18-9404-0d2eeea77a77	Golf shoes	golf-shoes	small	f	6	active	0	2026-06-30 12:51:58.444	2026-07-06 05:14:09.858
4b6cc178-4dbb-4f81-b93a-3b880de6f3ef	32f0204a-3178-4e18-9404-0d2eeea77a77	Golf balls	golf-balls	small	f	7	active	0	2026-06-30 12:51:58.446	2026-07-06 05:14:09.861
33275fcc-b68e-4a0a-9be2-f28a08caf20e	32f0204a-3178-4e18-9404-0d2eeea77a77	Golf glove	golf-glove	small	f	8	active	0	2026-06-30 12:51:58.449	2026-07-06 05:14:09.863
e655e163-f1f8-4878-98aa-eb40f5095fc6	f709b1fc-2781-48ff-939d-580689ffaec9	Tennis racket	tennis-racket	medium	f	1	active	0	2026-06-30 12:51:58.451	2026-07-06 05:14:09.865
65cb593e-50e4-4b0c-b3bb-7761e1a888a0	f709b1fc-2781-48ff-939d-580689ffaec9	Tennis bag	tennis-bag	medium	f	2	active	0	2026-06-30 12:51:58.453	2026-07-06 05:14:09.867
5693ba11-78df-4d07-9109-4bbfa896661a	f709b1fc-2781-48ff-939d-580689ffaec9	Tennis balls	tennis-balls	small	f	4	active	0	2026-06-30 12:51:58.457	2026-07-06 05:14:09.87
f2376834-733e-45df-8011-a587494fea88	f709b1fc-2781-48ff-939d-580689ffaec9	Tennis string	tennis-string	small	f	5	active	0	2026-06-30 12:51:58.459	2026-07-06 05:14:09.872
d86da6b3-cfdd-4ff4-9eca-74f79cf8e7a6	37a51d15-a650-439c-991d-26f4c9bcf296	Padel racket	padel-racket	medium	f	1	active	0	2026-06-30 12:51:58.461	2026-07-06 05:14:09.873
fd447633-dcc4-4b73-8cf6-848ab06e03da	37a51d15-a650-439c-991d-26f4c9bcf296	Padel bag	padel-bag	medium	f	2	active	0	2026-06-30 12:51:58.464	2026-07-06 05:14:09.875
1f83ba3a-1cb7-4781-80da-ca80fb090393	37a51d15-a650-439c-991d-26f4c9bcf296	Padel shoes	padel-shoes	small	f	3	active	0	2026-06-30 12:51:58.466	2026-07-06 05:14:09.877
dcd025a1-1698-4aeb-91d9-fe07ddb26ca7	37a51d15-a650-439c-991d-26f4c9bcf296	Padel balls	padel-balls	small	f	4	active	0	2026-06-30 12:51:58.468	2026-07-06 05:14:09.879
14e705ad-9fea-437e-8495-3fd3d0bec722	e4c80b3c-0d2c-44c7-b6c7-cbff417137e1	Squash racket	squash-racket	medium	f	1	active	0	2026-06-30 12:51:58.47	2026-07-06 05:14:09.882
82d9fa58-566b-4695-8fb8-939b4bd12982	e4c80b3c-0d2c-44c7-b6c7-cbff417137e1	Squash shoes	squash-shoes	small	f	2	active	0	2026-06-30 12:51:58.472	2026-07-06 05:14:09.884
2a45b6ca-c01c-4c9b-9b64-f4488277a110	e4c80b3c-0d2c-44c7-b6c7-cbff417137e1	Squash balls	squash-balls	small	f	3	active	0	2026-06-30 12:51:58.473	2026-07-06 05:14:09.886
3cd0e4bb-c5c7-4599-b3d5-645ceb25249d	e4c80b3c-0d2c-44c7-b6c7-cbff417137e1	Squash eyewear	squash-eyewear	small	f	4	active	0	2026-06-30 12:51:58.475	2026-07-06 05:14:09.889
0e56e53b-218d-4df1-b80c-abc1c7fe0492	f3564474-bfe8-46b7-be46-69cf968406fa	Running shoes	running-shoes	small	f	1	active	0	2026-06-30 12:51:58.477	2026-07-06 05:14:09.891
2e0b4d4d-25b3-478a-92ba-e1265dd30b33	f3564474-bfe8-46b7-be46-69cf968406fa	Running watch	running-watch	small	f	2	active	0	2026-06-30 12:51:58.478	2026-07-06 05:14:09.894
6109fa4f-c14a-48c0-9e3d-7862742d4072	f3564474-bfe8-46b7-be46-69cf968406fa	Running jacket	running-jacket	small	f	3	active	0	2026-06-30 12:51:58.48	2026-07-06 05:14:09.896
feb65ad9-b468-4a63-a5f0-de9a7f77ace6	f3564474-bfe8-46b7-be46-69cf968406fa	Running belt	running-belt	small	f	4	active	0	2026-06-30 12:51:58.481	2026-07-06 05:14:09.898
b17ada7f-cc2b-4050-8be5-cd4566ac494b	f3564474-bfe8-46b7-be46-69cf968406fa	Running shorts	running-shorts	small	f	5	active	0	2026-06-30 12:51:58.483	2026-07-06 05:14:09.9
19166cdf-62f7-450e-8138-a87c6e74b15a	d1fb5816-7587-439a-9597-c3af53fba403	Ski jacket	ski-jacket	medium	f	1	active	0	2026-06-30 12:51:58.484	2026-07-06 05:14:09.902
b3876c42-fcfe-481f-900a-d2dcbd179195	d1fb5816-7587-439a-9597-c3af53fba403	Ski trousers	ski-trousers	medium	f	2	active	0	2026-06-30 12:51:58.485	2026-07-06 05:14:09.905
d6edcd37-0084-461c-ae44-e64341b8b1c6	d1fb5816-7587-439a-9597-c3af53fba403	Ski pair	ski-pair	oversized	t	3	active	0	2026-06-30 12:51:58.486	2026-07-06 05:14:09.907
ec7f7a9b-5b38-46b0-bfc2-581a2e54f504	d1fb5816-7587-439a-9597-c3af53fba403	Ski poles	ski-poles	oversized	t	4	active	0	2026-06-30 12:51:58.488	2026-07-06 05:14:09.91
ff4bf65d-4ab8-4015-bc03-325424d187a5	d1fb5816-7587-439a-9597-c3af53fba403	Ski boots	ski-boots	small	f	5	active	0	2026-06-30 12:51:58.489	2026-07-06 05:14:09.913
a97d5f06-9c69-484e-a21f-443d6cbd23cf	d1fb5816-7587-439a-9597-c3af53fba403	Ski helmet	ski-helmet	small	f	6	active	0	2026-06-30 12:51:58.491	2026-07-06 05:14:09.914
ff541245-5fad-4437-871a-8fe73a448ae0	d1fb5816-7587-439a-9597-c3af53fba403	Ski goggles	ski-goggles	small	f	7	active	0	2026-06-30 12:51:58.492	2026-07-06 05:14:09.916
41c5c5c9-f6eb-4bf5-b146-3e1a024b3904	22cc1b43-16d9-4a1a-af14-2aa5fbe30cb9	Am. Football helmet	am-football-helmet	small	f	2	active	0	2026-06-30 12:51:58.496	2026-07-06 05:14:09.92
00dd36a5-9ab6-4b7e-a690-391417649ac0	22cc1b43-16d9-4a1a-af14-2aa5fbe30cb9	Am. Football cleats	am-football-cleats	small	f	3	active	0	2026-06-30 12:51:58.498	2026-07-06 05:14:09.921
853ab508-d719-43fa-bdf5-7503e1b0f040	22cc1b43-16d9-4a1a-af14-2aa5fbe30cb9	Am. Football	am-football	small	f	4	active	0	2026-06-30 12:51:58.499	2026-07-06 05:14:09.923
2ebc6bc2-af35-467d-ba00-db31c7b58231	5713ff8b-942d-48bd-ac82-7542f366b25b	Basketball	basketball	small	f	1	active	0	2026-06-30 12:51:58.501	2026-07-06 05:14:09.925
03adfe10-9352-432a-b3d0-775f2a738f4c	5713ff8b-942d-48bd-ac82-7542f366b25b	Basketball shoes	basketball-shoes	small	f	2	active	0	2026-06-30 12:51:58.502	2026-07-06 05:14:09.927
bbaff55d-ac0f-46c0-97b5-af81a3d27282	5713ff8b-942d-48bd-ac82-7542f366b25b	Basketball jersey	basketball-jersey	small	f	3	active	0	2026-06-30 12:51:58.504	2026-07-06 05:14:09.928
fc77f31d-4b23-4360-85cc-bf1c420e5f80	5713ff8b-942d-48bd-ac82-7542f366b25b	Basketball shorts	basketball-shorts	small	f	4	active	0	2026-06-30 12:51:58.506	2026-07-06 05:14:09.93
0cf0f066-1b4d-4dc9-b8d3-8a23a69546c4	ae4d3a1d-ead1-4558-9aaf-18c3de5952d2	Ice hockey shin pads	ice-hockey-shin-pads	medium	f	1	active	0	2026-06-30 12:51:58.507	2026-07-06 05:14:09.931
5fa1b5a9-ef8b-4fa5-83b2-25656b615432	ae4d3a1d-ead1-4558-9aaf-18c3de5952d2	Ice hockey stick	ice-hockey-stick	oversized	t	2	active	0	2026-06-30 12:51:58.509	2026-07-06 05:14:09.933
ffc99045-6989-4eac-980c-a98d8935b467	ae4d3a1d-ead1-4558-9aaf-18c3de5952d2	Ice hockey skates	ice-hockey-skates	small	f	3	active	0	2026-06-30 12:51:58.511	2026-07-06 05:14:09.934
e525a144-b936-4201-9b59-9a14041b8fef	ae4d3a1d-ead1-4558-9aaf-18c3de5952d2	Ice hockey helmet	ice-hockey-helmet	small	f	4	active	0	2026-06-30 12:51:58.514	2026-07-06 05:14:09.936
7c3806a4-ff28-49f3-9e50-a82b4d3e6273	ae4d3a1d-ead1-4558-9aaf-18c3de5952d2	Ice hockey gloves	ice-hockey-gloves	small	f	5	active	0	2026-06-30 12:51:58.515	2026-07-06 05:14:09.938
e3e1084f-1fdd-4fc9-9406-ebadf770a342	ae4d3a1d-ead1-4558-9aaf-18c3de5952d2	Ice hockey pads	ice-hockey-pads	small	f	6	active	0	2026-06-30 12:51:58.517	2026-07-06 05:14:09.94
5f474038-52c8-4c39-bf42-73a0977ee707	c7bc85fd-9db3-4556-b348-6eacbb157a56	Netball	netball	small	f	1	active	0	2026-06-30 12:51:58.518	2026-07-06 05:14:09.942
fd47bdea-4d3f-4d4f-8d77-78a9a07ad087	c7bc85fd-9db3-4556-b348-6eacbb157a56	Netball shoes	netball-shoes	small	f	2	active	0	2026-06-30 12:51:58.52	2026-07-06 05:14:09.944
5f85d244-3187-4c32-97bb-437dd1e23664	c7bc85fd-9db3-4556-b348-6eacbb157a56	Netball bib	netball-bib	small	f	3	active	0	2026-06-30 12:51:58.522	2026-07-06 05:14:09.946
95c34871-7936-42d4-b1e0-465b691916d0	baf3ad38-48c9-4ff7-96dc-ebd0a995fa2e	Road bike	road-bike	oversized	t	1	active	0	2026-06-30 12:51:58.524	2026-07-06 05:14:09.947
d1a35c6f-b55b-4dab-8bc7-e68828b21045	baf3ad38-48c9-4ff7-96dc-ebd0a995fa2e	Cycling helmet	cycling-helmet	small	f	2	active	0	2026-06-30 12:51:58.526	2026-07-06 05:14:09.949
f4cc448e-805d-4ee0-8a82-e427dce5c351	baf3ad38-48c9-4ff7-96dc-ebd0a995fa2e	Cycling shoes	cycling-shoes	small	f	3	active	0	2026-06-30 12:51:58.528	2026-07-06 05:14:09.951
5c06d1da-77da-421b-9272-32ae148979af	a6910ea0-b215-4eda-bdba-e9a2a1827de4	Batting pads	batting-pads	medium	f	2	active	0	2026-06-30 12:51:58.402	2026-07-06 05:14:09.817
016d573b-e228-45ab-8c87-6b5e3bc3a832	a6910ea0-b215-4eda-bdba-e9a2a1827de4	Cricket bag	cricket-bag	medium	f	3	active	0	2026-06-30 12:51:58.406	2026-07-06 05:14:09.82
5012cb76-d078-411b-8545-48082a9dd678	1be57f95-46ff-41af-a72b-c2969907432b	Rugby headguard	rugby-headguard	small	f	5	active	0	2026-06-30 12:51:58.555	2026-07-06 05:14:09.978
fc99d825-81a2-489e-b547-198fffdd2f40	96e0f7bc-447e-4524-94cf-1f05250a1271	Badminton racket	badminton-racket	medium	f	1	active	0	2026-06-30 12:51:58.557	2026-07-06 05:14:09.98
e76d7ae3-484e-4a12-abf2-ef33ca54a84f	96e0f7bc-447e-4524-94cf-1f05250a1271	Badminton shuttlecocks	badminton-shuttlecocks	small	f	2	active	0	2026-06-30 12:51:58.559	2026-07-06 05:14:09.981
4a3e10fa-7580-46df-b3e0-1ea444fae0ec	96e0f7bc-447e-4524-94cf-1f05250a1271	Badminton shoes	badminton-shoes	small	f	3	active	0	2026-06-30 12:51:58.56	2026-07-06 05:14:09.983
b1aa9108-3b40-4937-abfd-a63af27527ca	96e0f7bc-447e-4524-94cf-1f05250a1271	Badminton bag	badminton-bag	small	f	4	active	0	2026-06-30 12:51:58.562	2026-07-06 05:14:09.985
4c1fbacf-2338-4d77-9b5c-fa4c679f1105	c4f15d98-401e-4020-b136-b0148a820978	Punch bag	punch-bag	oversized	t	1	active	0	2026-06-30 12:51:58.564	2026-07-06 05:14:09.987
9af94f10-b16e-4970-91ee-5fb6f08bfd62	c4f15d98-401e-4020-b136-b0148a820978	Boxing gloves	boxing-gloves	small	f	2	active	0	2026-06-30 12:51:58.566	2026-07-06 05:14:09.989
85d20e47-5eb3-4ed0-b714-102dfd27eb52	c4f15d98-401e-4020-b136-b0148a820978	MMA gloves	mma-gloves	small	f	3	active	0	2026-06-30 12:51:58.568	2026-07-06 05:14:09.991
e6ee91e4-9424-4874-a184-2a5e11ca4241	c4f15d98-401e-4020-b136-b0148a820978	Hand wraps	hand-wraps	small	f	4	active	0	2026-06-30 12:51:58.569	2026-07-06 05:14:09.993
2ee93f46-3f89-41ad-b3be-b361f9473db3	c4f15d98-401e-4020-b136-b0148a820978	Headguard	headguard	small	f	5	active	0	2026-06-30 12:51:58.57	2026-07-06 05:14:09.994
4874e98f-726d-4623-9f05-ec5fb26fd72c	c4f15d98-401e-4020-b136-b0148a820978	Boxing boots	boxing-boots	small	f	6	active	0	2026-06-30 12:51:58.572	2026-07-06 05:14:09.996
854c866d-9a37-4078-9aed-aa6a12deb228	a6910ea0-b215-4eda-bdba-e9a2a1827de4	Cricket bat	cricket-bat	large	f	1	active	0	2026-06-30 12:51:58.382	2026-07-06 05:14:09.81
068cbffe-74de-4b97-916d-34fc0f223b8a	f709b1fc-2781-48ff-939d-580689ffaec9	Tennis shoes	tennis-shoes	small	f	3	active	0	2026-06-30 12:51:58.455	2026-07-06 05:14:09.869
415fda3b-fa7f-46e0-9727-e18b00e0f0d3	22cc1b43-16d9-4a1a-af14-2aa5fbe30cb9	Am. Football shoulder pads	am-football-shoulder-pads	medium	f	1	active	0	2026-06-30 12:51:58.494	2026-07-06 05:14:09.918
f9a971ce-9dc5-499b-991a-023fe2df8a39	baf3ad38-48c9-4ff7-96dc-ebd0a995fa2e	Cycling jersey	cycling-jersey	small	f	4	active	0	2026-06-30 12:51:58.53	2026-07-06 05:14:09.953
5fb3f2ed-ab5f-4ccd-a615-8555c6ef8cdd	baf3ad38-48c9-4ff7-96dc-ebd0a995fa2e	Bike lock	bike-lock	small	f	5	active	0	2026-06-30 12:51:58.535	2026-07-06 05:14:09.954
757ad13e-9fbe-491c-a130-68e0a1a01abe	baf3ad38-48c9-4ff7-96dc-ebd0a995fa2e	Cycling gloves	cycling-gloves	small	f	6	active	0	2026-06-30 12:51:58.537	2026-07-06 05:14:09.956
e8785b11-a214-4a38-8aa4-61abc0991632	b9cbd9fd-c00d-4c0b-8fc0-1484bd645613	Swimming costume	swimming-costume	small	f	1	active	0	2026-06-30 12:51:58.539	2026-07-06 05:14:09.957
61a9b52a-3d05-4233-9213-feed01c7a9ad	b9cbd9fd-c00d-4c0b-8fc0-1484bd645613	Swimming goggles	swimming-goggles	small	f	2	active	0	2026-06-30 12:51:58.54	2026-07-06 05:14:09.96
d10f182c-4446-4ab9-aab0-4f79a1b8d6be	b9cbd9fd-c00d-4c0b-8fc0-1484bd645613	Swim cap	swim-cap	small	f	3	active	0	2026-06-30 12:51:58.543	2026-07-06 05:14:09.963
4960f987-d25e-4c96-b976-eac92372bb01	b9cbd9fd-c00d-4c0b-8fc0-1484bd645613	Swimming fins	swimming-fins	small	f	4	active	0	2026-06-30 12:51:58.545	2026-07-06 05:14:09.965
e200118c-fc5b-460f-b035-bc6f52c1e494	b9cbd9fd-c00d-4c0b-8fc0-1484bd645613	Kickboard	kickboard	small	f	5	active	0	2026-06-30 12:51:58.547	2026-07-06 05:14:09.968
73a1768b-a3ad-4e7f-b1e3-ccf2df88cee2	1be57f95-46ff-41af-a72b-c2969907432b	Rugby body armour	rugby-body-armour	medium	f	1	active	0	2026-06-30 12:51:58.549	2026-07-06 05:14:09.97
cc9f0709-4d68-494c-9801-fb044ff1869f	1be57f95-46ff-41af-a72b-c2969907432b	Rugby ball	rugby-ball	small	f	2	active	0	2026-06-30 12:51:58.551	2026-07-06 05:14:09.973
0ff2b805-e723-42d9-abec-db8d5eaf1f13	1be57f95-46ff-41af-a72b-c2969907432b	Rugby boots	rugby-boots	small	f	3	active	0	2026-06-30 12:51:58.552	2026-07-06 05:14:09.975
87746ae4-eae8-4261-9ad2-c8f6034ab779	1be57f95-46ff-41af-a72b-c2969907432b	Rugby shirt	rugby-shirt	small	f	4	active	0	2026-06-30 12:51:58.554	2026-07-06 05:14:09.977
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, username, display_name, avatar_url, role, account_status, auth_provider, email_verified, password_hash, two_factor_enabled, two_factor_secret, holiday_mode, stripe_customer_id, stripe_connect_id, bank_account_last4, bank_sort_code_masked, suspension_end_date, suspension_reason, total_sales, average_rating, review_count, verified_seller, violation_count, last_active_at, notification_order_updates, notification_messages, notification_price_drops, notification_promotions, notification_disputes, preferred_sports, privacy_profile_public, privacy_data_sharing, created_at, updated_at, deleted_at, email_verification_expires, email_verification_token, failed_login_attempts, lockout_until, password_reset_expires, password_reset_token, two_factor_temp_secret, last_failed_login_at, two_factor_method, two_factor_pending_code, two_factor_pending_code_expires, two_factor_pending_phone, two_factor_phone, default_parcel_size) FROM stdin;
62bebcd0-88aa-4777-89c0-33e51b4a66e3	admin.test@kitloop.dev	admin_test	admin_test	\N	admin	active	email	t	$2b$12$xrDnR07/kGMuFWYE94Pvluq0JAcy7q6XhTp1j/PGOyZySwVt4IvK.	f	\N	f	\N	\N	\N	\N	\N	\N	0	\N	0	f	0	2026-06-30 13:19:09.78	t	t	t	f	t	\N	t	t	2026-06-30 13:13:25.554	2026-06-30 13:19:09.781	\N	2026-07-01 13:13:25.515	2c063ac162bdb00655653c70d368e631f73cf0b1a750aeaa3cb14e3b457b3e04	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
80e02dcb-db5b-48c4-a53e-2596e1454fd8	erin@example.com	erin_w	erin_w	\N	buyer	active	email	f	$2b$12$lNSS.rffLWm4zMmqf6XHV.YjXmXheMlk83asVUhQJ6CrlInFFnLCO	f	\N	f	\N	\N	\N	\N	\N	\N	0	\N	0	f	0	2026-06-30 11:28:34.392	t	t	t	f	t	\N	t	t	2026-06-30 11:27:25.008	2026-06-30 11:29:03.402	\N	2026-07-01 11:27:24.993	f4219863b3e3cd2646794d1d4503bec330efc9b73f13023601a09d3d26bc6419	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b3a05005-de0b-44fb-a34c-e18e76facc70	seller@test.com	test_seller	Test Seller	\N	seller	active	email	t	$2b$10$djCq369rqKT4nJNBnkqFjOS6j5S3.6B8GjcnWLPeD2H8oahCtjAHG	f	\N	f	cus_Uqz1ogVY5ry4Ry	\N	\N	\N	\N	\N	1	5.00	2	f	0	2026-07-09 12:57:04.972	t	t	t	f	t	\N	t	t	2026-07-06 06:53:51.691	2026-07-09 12:57:04.973	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	medium
47801513-0877-4c2d-b332-e212c62ac37a	dave@example.com	dave_w	dave_w	\N	buyer	active	email	f	$2b$12$Y8aZSFZhk3ADj9uFHYeRmehakP2wqMhxpmFGs8C0k8w/GmzMpTmTW	f	\N	f	\N	\N	\N	\N	\N	\N	0	\N	0	f	0	\N	t	t	t	f	t	\N	t	t	2026-06-30 09:05:30.372	2026-06-30 09:05:32.356	\N	2026-07-01 09:05:30.372	f7b50b2e519919795f8519f10bd9176436f8c67caa76fff4c66e846435d9f119	5	2026-06-30 09:20:32.354	\N	\N	\N	2026-06-30 09:05:32.354	\N	\N	\N	\N	\N	\N
7afca83c-bda7-483e-ab3c-7d70d13ff2c2	carol@example.com	carol_w	carol_w	\N	buyer	active	email	t	$2b$12$cbkxZq4npyNxvcQ1oVNiCedQWO38nhf2BWI5Sia2CQWVi/zaTCJi2	t	2GCMAN24UEJUXYJNAQTB32X4HYWNQFUF	f	\N	\N	\N	\N	\N	\N	0	\N	0	f	0	2026-06-30 09:05:22.382	t	t	t	f	t	\N	t	t	2026-06-30 09:04:44.103	2026-06-30 09:11:22.921	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8ba77c5c-e401-4529-8680-67bef9367d81	both@test.com	test_both	Test BuyerSeller	\N	both	active	email	t	$2b$10$djCq369rqKT4nJNBnkqFjOS6j5S3.6B8GjcnWLPeD2H8oahCtjAHG	f	\N	f	\N	\N	\N	\N	\N	\N	0	\N	0	f	0	\N	t	t	t	f	t	\N	t	t	2026-07-06 06:53:51.702	2026-07-06 06:53:51.702	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c918ae51-01c2-4dd6-8f92-5e1e53cf44bc	alice@example.com	alice_w	alice_w	\N	buyer	active	email	f	$2b$12$UbohMh64rQuuNGlgVRrf2O4YGySGZ7P9pYY7TiJi1rNy1fk/JpPCi	f	\N	f	\N	\N	\N	\N	\N	\N	0	\N	0	f	0	2026-06-30 09:11:43.298	t	t	t	f	t	\N	t	t	2026-06-30 08:58:06.864	2026-06-30 09:11:43.298	\N	2026-07-01 08:58:06.839	f6efa036f279ae5f4665d838ad82270707db51280c0137ed431e2f63c412a6a1	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
610d792e-c9f0-4660-af0d-9c486377f4d5	gail@example.com	gail_w	gail_w	\N	buyer	active	email	t	$2b$12$8TYW3j1zB6oJW3/hq46y0OgFR7Ixu1MzaVAUxjx1hXhphsbC2UzFG	f	\N	f	\N	\N	\N	\N	\N	\N	0	\N	0	f	0	\N	t	t	t	f	t	\N	t	t	2026-06-30 11:29:32.576	2026-06-30 11:29:47.725	\N	\N	\N	5	2026-06-30 11:44:34.703	\N	\N	\N	2026-06-30 11:29:34.703	\N	\N	\N	\N	\N	\N
22d6a9d2-e3e1-46f7-b265-fd48a1f9e100	helen1782819228616@example.com	helen_28617	helen_28617	\N	buyer	active	email	f	$2b$12$pr0g3HUCDjT5Iz8C/OTx2.SfyPaqBV1OeMOI9BX3L4.pJz4cHw34m	f	\N	f	\N	\N	\N	\N	\N	\N	0	\N	0	f	0	2026-06-30 11:33:49.727	t	t	t	f	t	\N	t	t	2026-06-30 11:33:49.356	2026-06-30 11:33:49.732	\N	2026-07-01 11:33:49.346	19d3282964cec085c8f8c9c1814afca70ac3f654ea0779fd762f34f9dc6af138	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
19ce4223-979d-4c00-9d94-e0c498579e93	buyer@test.com	test_buyer	Test Buyer	\N	buyer	active	email	t	$2b$10$djCq369rqKT4nJNBnkqFjOS6j5S3.6B8GjcnWLPeD2H8oahCtjAHG	f	\N	f	cus_UpsijuNdIAaYjU	\N	\N	\N	\N	\N	0	\N	0	f	0	2026-07-09 13:10:36.293	t	t	t	f	t	\N	t	t	2026-07-06 06:53:51.664	2026-07-09 13:10:36.296	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b55eae55-51f3-492a-8f3b-b71026bb2f16	ram.vala@gmail.com	ramvala	ramvala	\N	buyer	active	email	f	$2b$12$xkQo4olaZs.IgkFZxgX09OdTt4elJOxFFv7Z8I5Yz8c5z.fiGUmh6	f	\N	f	\N	\N	\N	\N	\N	\N	0	\N	0	f	0	2026-06-30 13:10:14.148	t	t	t	f	t	\N	t	t	2026-06-30 12:02:53.083	2026-06-30 13:10:14.167	\N	2026-07-01 12:02:53.069	d3d67cf4bd8bfa37710abc9341256a39cd65cbdbe687a21594d480080a5e1661	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3848d9ae-cf93-4532-a774-541752473dc4	admin@test.com	test_admin	Test Admin	\N	admin	active	email	t	$2b$10$djCq369rqKT4nJNBnkqFjOS6j5S3.6B8GjcnWLPeD2H8oahCtjAHG	f	\N	f	\N	\N	\N	\N	\N	\N	0	\N	0	f	0	2026-07-08 15:08:12.653	t	t	t	f	t	\N	t	t	2026-07-06 06:53:51.708	2026-07-08 15:08:12.661	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
da804619-9850-49d6-a79f-9ddc7ccd6b96	ramvala@gmail.com	ramvala2026	ramvala2026	\N	buyer	active	email	f	$2b$12$3Re2EOWTiYokXRDuPPorPeKouSI33y8idJrxwQWm/AdjavjN0Xexi	f	\N	f	cus_Uq8d31wrBhBvlO	\N	\N	\N	\N	\N	0	\N	0	f	0	2026-07-07 06:18:26.311	t	t	t	f	t	\N	t	t	2026-07-07 06:18:04.72	2026-07-07 06:19:36.309	\N	2026-07-08 06:18:04.713	46b8834261e3d3810f19b3f7cfa54e8571e09a45c59b710e071fafd7075812ce	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


-- Completed on 2026-07-24 18:29:56

--
-- PostgreSQL database dump complete
--

\unrestrict zCdibaSDzhThOMZclTiUmWpPjDyHttmcV5hA4zNY1KY2tbzW6mYDzlb8imfxM4F
