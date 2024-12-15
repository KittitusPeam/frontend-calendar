$(document).ready(function () {
    $('#generateBtn').on('click', function() {
        // Get the input value
        const customerIdsInput = $('#customerIds').val();

        // Split the input into an array of IDs
        const customerIds = customerIdsInput.split(',').map(id => id.trim()).filter(id => id !== '');

        // Generate SQL statements
        let sqlStatements = '';
        customerIds.forEach(id => {
            sqlStatements += `UPDATE [POS_JayUbon01].[dbo].[MbMaster]\nSET f_Custinfo = 'ได้รับของขวัญปีใหม่แล้ว', f_IsUse = 0\nWHERE f_MbCode = '${id}';\n\n`;
        });

        // Set the SQL output
        $('#sqlOutput').val(sqlStatements);

        // Show the copy button
        $('#copyBtn').removeClass('d-none');
    });

    $('#copyBtn').on('click', function() {
        const sqlOutput = $('#sqlOutput');
        sqlOutput.select();
        sqlOutput[0].setSelectionRange(0, 99999); // For mobile devices
        document.execCommand('copy');

        // Show SweetAlert2 confirmation
        Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: 'SQL statements have been copied to the clipboard.',
            confirmButtonText: 'OK'
        });
    });

    // New button to copy SELECT query
    $('#copySelectBtn').on('click', function() {
        const selectQuery = "SELECT f_MbCode, f_Custinfo, f_IsUse\nFROM [POS_JayUbon01].[dbo].[MbMaster];";
        const tempTextArea = $('<textarea>').val(selectQuery).appendTo('body');
        tempTextArea.select();
        document.execCommand('copy');
        tempTextArea.remove();

        // Show SweetAlert2 confirmation
        Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: 'SELECT query has been copied to the clipboard.',
            confirmButtonText: 'OK'
        });
    });
});