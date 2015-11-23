		function getCSSStyle( status) {
			var cssStyle = 'stratItem';
			
			switch(status) {
				case '1':
					cssStyle = "stratItemBlack";
					break;
				case '2':
					cssStyle = "stratItemRed";
					break;
				case '3':
					cssStyle = "stratItemYellow";
					break;
				case '4':
					cssStyle = "stratItemGreen";
					break;
				case '5':
					cssStyle = "stratItemGreen";
					break;
				case '6':
					cssStyle = "stratItemBlue";
					break;
				default:
					cssStyle = "stratItemWhite";
			}
			return cssStyle;
		}
