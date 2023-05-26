pm.test("Visualize data", function () {
    let jsonResponse = pm.response.json();
    let totalCostChat = 0;
    let totalCostDALLE = 0;
    let totalCostWhisper = 0;

    // CSS styles
    let styles = `<style>
    .my-table {
        border:1px solid #74BCAB; 
        border-collapse: collapse;
        margin: 10px 0;
    }
    .my-table th, .my-table td {
        border:1px solid #74BCAB; 
        padding:5px;
    }
    body {
        padding-left: 20px;
    }
    hr {
        border: none;
        height: 2px;
        background: #74BCAB;
        background: linear-gradient(to right, transparent, #74BCAB, transparent);
    }
    h4 {
        color: #74BCAB;
    }
    </style>`;
    
    // ChatGPT API data
    let generalData = jsonResponse.data;
    let generalTemplate = `<h4>Chat</h4>
                            <table class="my-table">
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Requests</th>
                                    <th>Operation</th>
                                    <th>Model</th>
                                    <th>Contexts</th>
                                    <th>Total Context Tokens</th>
                                    <th>Generated</th>
                                    <th>Total Generated Tokens</th>
                                    <th>Total Tokens</th>
                                    <th>Cost</th>
                                </tr>`;
                                for(let i = 0; i < generalData.length; i++) {
                                    let totalTokens = generalData[i].n_context_tokens_total + generalData[i].n_generated_tokens_total;
                                    let price = 0;
                                    if (generalData[i].snapshot_id === "gpt-4-0314") {
                                        price = totalTokens * 0.06 / 1000;
                                    } else if (generalData[i].snapshot_id === "gpt-3.5-turbo-0301") {
                                        price = totalTokens * 0.002 / 1000;
                                    }
                                    totalCostChat += price;
        generalTemplate += `<tr>
                                <td>${new Date(generalData[i].aggregation_timestamp * 1000).toLocaleString()}</td>
                                <td>${generalData[i].n_requests}</td>
                                <td>${generalData[i].operation}</td>
                                <td>${generalData[i].snapshot_id}</td>
                                <td>${generalData[i].n_context}</td>
                                <td>${generalData[i].n_context_tokens_total}</td>
                                <td>${generalData[i].n_generated}</td>
                                <td>${generalData[i].n_generated_tokens_total}</td>
                                <td>${totalTokens}</td>
                                <td>$${price.toFixed(4)}</td>
                            </tr>`;
                        }
   generalTemplate += "</table>";

    // DALL-E API data
    let dalleData = jsonResponse.dalle_api_data;
    let dalleTemplate = `<h4>DALL·E</h4>
                                <table class="my-table">
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Images</th>
                                    <th>Requests</th>
                                    <th>Size</th>
                                    <th>Operation</th>
                                    <th>Cost</th>
                                </tr>`;
    for(let i = 0; i < dalleData.length; i++) {
        let price = 0;
        switch (dalleData[i].image_size) {
            case "1024x1024":
                price = dalleData[i].num_images * 0.020;
                break;
            case "512x512":
                price = dalleData[i].num_images * 0.018;
                break;
            case "256x256":
                price = dalleData[i].num_images * 0.016;
                break;
            default:
                break;
        }

        dalleTemplate += `<tr>
                            <td>${new Date(dalleData[i].timestamp * 1000).toLocaleString()}</td>
                            <td>${dalleData[i].num_images}</td>
                            <td>${dalleData[i].num_requests}</td>
                            <td>${dalleData[i].image_size}</td>
                            <td>${dalleData[i].operation}</td>
                            <td>$${price.toFixed(4)}</td>
                        </tr>`;
        totalCostDALLE += price;
    }
    dalleTemplate += "</table>";

    // Whisper API Data
    let whisperData = jsonResponse.whisper_api_data;
    let whisperTemplate = `<h4>Whisper</h4>
                            <table class="my-table">
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Model</th>
                                    <th>Seconds</th>
                                    <th>Requests</th>
                                    <th>Cost</th>
                                </tr>`;
    for(let i = 0; i < whisperData.length; i++) {
        let price = whisperData[i].num_seconds / 60 * 0.006;
        let date = new Date(whisperData[i].timestamp * 1000);
        whisperTemplate += `<tr>
                                <td>${date.toLocaleString()}</td>
                                <td>${whisperData[i].model_id}</td>
                                <td>${whisperData[i].num_seconds}</td>
                                <td>${whisperData[i].num_requests}</td>
                                <td>$${price.toFixed(4)}</td>
                            </tr>`;
        totalCostWhisper += price;                    
    }
    whisperTemplate += "</table>";


    // Calculate the total cost
    let totalCost = totalCostChat + totalCostDALLE + totalCostWhisper;

    // Summary table
    let summaryTemplate = `<h4>Summary</h4>
                                <table class="my-table">
                                <tr>
                                    <th>API</th>
                                    <th>Total Cost</th>
                                </tr>
                                <tr>
                                    <td>Chat</td>
                                    <td>$${totalCostChat.toFixed(4)}</td>
                                </tr>
                                <tr>
                                    <td>DALL-E</td>
                                    <td>$${totalCostDALLE.toFixed(4)}</td>
                                </tr>
                                <tr>
                                    <td>Whisper</td>
                                    <td>$${totalCostWhisper.toFixed(4)}</td>
                                </tr>
                                <tr>
                                    <td>Total</td>
                                    <td>$${totalCost.toFixed(4)}</td>
                                </tr>
                            </table>`;

    // Current usage
    let currentUsageTemplate = `<h4>Current Usage</h4>
                                <p>${jsonResponse.current_usage_usd} USD</p>`;

    // Combine all templates with horizontal lines in between
    let completeTemplate = "<br>" + generalTemplate + "<hr>" + dalleTemplate + "<hr>" + whisperTemplate + "<hr>" + summaryTemplate + "<hr>" + currentUsageTemplate;

    // Set visualizer
    pm.visualizer.set(styles + completeTemplate);

    // Log the HTML to the console
    //console.log(styles + completeTemplate);
});
