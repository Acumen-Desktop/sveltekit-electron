<script lang="ts">
  import { FileManager } from 'wx-svelte-filemanager';

	const rawdata = [
		{
			id: '/Code',
			size: 4096,
			date: new Date(2023, 11, 2, 17, 25),
			type: 'folder'
		},
		{
			id: '/Music',
			size: 4096,
			date: new Date(2023, 11, 1, 14, 45),
			type: 'folder'
		},

		{
			id: '/Info.txt',
			size: 1000,
			date: new Date(2023, 10, 30, 6, 13),
			type: 'file'
		},
		{
			//parent: "/Code/Datepicker",
			id: '/Code/Datepicker/Year.svelte',
			size: 1595,
			date: new Date(2023, 11, 7, 15, 23),
			type: 'file'
		},
		{
			id: '/Pictures/162822515312968813.png',
			size: 510885,
			date: new Date(2023, 11, 1, 14, 45),
			type: 'file'
		}
	];
</script>

<FileManager data={rawdata} />
